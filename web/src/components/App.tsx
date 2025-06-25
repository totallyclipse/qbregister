import React, { useState, useEffect } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Define the MenuItem type
interface MenuItem {
  quantity: number;
  itemname: string;
  itemlabel: string;
  combo: boolean;
  image: string;
  price: number;
  itemcategory: string;
  ingredients: {
    [key: string]: number;
  };
}

interface SelectedItem extends MenuItem {
  quantity: number; 
}

const App: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]); // Adjusted type
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [pdEmsSelected, setPdEmsSelected] = useState(false);
  const [employeeSelected, setEmployeeSelected] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // New state for selected category
  const [menuTitle, setMenuTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [govDiscountAmount, setGovDiscount] = useState<number>(0);
  const [employeeDiscountAmount, setEmployeeDiscount] = useState<number>(0);


  // Function to handle NUI messages
  useEffect(() => {
    const handleMenuMessage = (event: MessageEvent) => {
      const { action, menu, receivedCategories, recTitle, recDesc, empDisc, govDisc } = event.data;
      if (action === "sendMenu") {
        setMenuItems(menu);
        setCategories(receivedCategories);
        setMenuTitle(recTitle);
        setDescription(recDesc);
        setEmployeeDiscount(empDisc);
        setGovDiscount(govDisc);
      }
    };

    window.addEventListener("message", handleMenuMessage);
    return () => {
      window.removeEventListener("message", handleMenuMessage);
    };
  }, []);

  // Prevent NUI from closing on Backspace key press when in input fields
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Check if the focused element is an input or textarea
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        if (event.key === "Backspace") {
          event.stopPropagation();
          // event.preventDefault(); // Optionally prevent default behavior if needed
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const newSubtotal = selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubtotal(newSubtotal);
  }, [selectedItems]);

  const handleClearCart = () => {
    setSelectedItems([]); // Set the selectedItems to an empty array
  };

  const handleItemClick = (clickedItem: MenuItem) => {
    setSelectedItems((prevSelectedItems) => {
      const existingItem = prevSelectedItems.find(
        (item) => item.itemname === clickedItem.itemname
      );

      if (existingItem) {
        return prevSelectedItems.map((item) =>
          item.itemname === clickedItem.itemname
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevSelectedItems, { ...clickedItem, quantity: 1 }];
      }
    });
  };

  const handlePdEmsToggle = () => {
    setPdEmsSelected((prev) => !prev);
  };

  const handleEmployeeToggle = () => {
    setEmployeeSelected((prev) => !prev);
    
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v1 = e.target.value;
    v1 = v1.replace(/^0+(?!$)/, "");
    let value = parseInt(v1, 10);
    if (isNaN(value)) {
      setDiscount(0);
    } else {
      value = Math.min(Math.max(value, 0), 100);
      setDiscount(value);
    }
  };

  const handleCategoryClick = (categoryValue: string) => {
    setSelectedCategory(categoryValue); // Set the selected category
  };

  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.itemcategory === selectedCategory)
    : menuItems;

  const perDisc = discount ? Math.floor(subtotal * (1 - discount / 100)) : subtotal;
  const discountedTotal = pdEmsSelected ? Math.floor(perDisc * (1 - govDiscountAmount / 100)) : perDisc;

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.filter((_, i) => i !== index)
    );
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return (
    <div className="nui-wrapper">
      <div className="popup-thing">
        <div>
          <h1>{menuTitle}</h1>
          <h2>{description}</h2>
          <div className="sidebar">
            <ul className="tabs-list">
            <li className="tab-item" onClick={() => handleCategoryClick("")}>All</li>
              {categories.map((category) => (
                <li
                  className="tab-item"
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)} // Handle category click
                >
                  {category.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-items">
            {filteredMenuItems.map((menuItem) => (
              <div className="item" key={menuItem.itemname} onClick={() => handleItemClick(menuItem)}>
                <div className="price">${menuItem.price}</div>
                <img src={menuItem.image} alt={menuItem.itemname} />
                <p>{menuItem.itemlabel}</p>
              </div>
            ))}
          </div>
        </div>
  
        <div className="checkout-items">
          <h2>Selected Items:</h2>
          <div className="selected-items">
          {selectedItems.map((item, index) => (
            <div className="selected-item-card" key={index}>
              <img className="selected-item-image" src={item.image} alt={item.itemname} />
              <div className="selected-item-content">
                <strong>{item.itemlabel}</strong>${item.price * item.quantity} <br />
                <div className="quantity-container">
                  <label htmlFor={`quantity-${index}`}>Quantity:</label>
                  <div className="quantity-wrapper">
                    <button
                      className="quantity-btn-minus"
                      onClick={() => handleQuantityChange(index, Math.max(item.quantity - 1, 1))}
                    >
                      -
                    </button>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      min="1"
                      step="1"
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value, 10);
                        if (!isNaN(newValue) && newValue > 0) {
                          handleQuantityChange(index, newValue);
                        }
                      }}
                      onBlur={(e) => {
                        if (!e.target.value || parseInt(e.target.value, 10) < 1) {
                          handleQuantityChange(index, 1);
                        }
                      }}
                    />
                    <button
                      className="quantity-btn-plus"
                      onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <FontAwesomeIcon
                icon={faTrash}
                className="trash-icon"
                onClick={() => handleRemoveItem(index)}
              />
            </div>
          ))}
          </div>
          <div className = "button-container">
          <button
            className="clear-cart-button"
            onClick={handleClearCart} // Make sure to define this function to clear the cart
          >
            <FontAwesomeIcon icon="shopping-cart" /> Clear Cart
          </button>
          </div>
          <div className="button-container">
            <button
              className={`toggle-button ${pdEmsSelected ? "active" : ""}`}
              onClick={handlePdEmsToggle}
            >
              PD/EMS
            </button>
            <button
              className={`toggle-button ${employeeSelected ? "active" : ""}`}
              onClick={handleEmployeeToggle}
            >
              Employee
            </button>
            <button
              className={`toggle-button ${discount !== null ? "active" : ""}`}
              onClick={() => setDiscount(discount !== null ? null : 0)}
            >
              % Off
            </button>
            {discount !== null && (
              <div className="discount-input-container">
                <input
                  type="number"
                  value={discount !== null ? Number(discount).toString() : ""}
                  onChange={handleDiscountChange}
                  placeholder="Enter discount %"
                  min="0"
                />
                <span>%</span>
              </div>
            )}
          </div>

          <div className="chargebuttonbox">
            {/* <div className="checkouttext1">
              Charge<br />
            </div> */}
            <div className="checkouttext2">
              Total: ${discount || pdEmsSelected ? discountedTotal : subtotal}
            </div>
            <button className="chargeorder-button">
              Charge Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

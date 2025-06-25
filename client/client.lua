local function toggleNuiFrame(shouldShow)
  SetNuiFocus(shouldShow, shouldShow)
  SendReactMessage('setVisible', shouldShow)
end

function dump(o)
  if type(o) == 'table' then
     local s = '{ '
     for k,v in pairs(o) do
        if type(k) ~= 'number' then k = '"'..k..'"' end
        s = s .. '['..k..'] = ' .. dump(v) .. ','
     end
     return s .. '} '
  else
     return tostring(o)
  end
end

RegisterCommand('sf', function()
  SendNUIMessage({
    action = "sendMenu",
    menu = Config.Menus["burgershot"].menuItems,
    receivedCategories = Config.Menus["burgershot"].categories,
    recTitle = Config.Menus["burgershot"].titleLabel,
    recDesc = Config.Menus["burgershot"].description,
    empDisc = Config.Menus["burgershot"].employeeDiscount,
    govDisc = Config.Menus["burgershot"].govDiscount,
  })
  toggleNuiFrame(true)
  debugPrint('Show NUI frame')
end)


RegisterNUICallback('hideFrame', function(_, cb)
  toggleNuiFrame(false)
  debugPrint('Hide NUI frame')
  cb({})
end)

RegisterNUICallback('getClientData', function(data, cb)
  debugPrint('Data sent by React', json.encode(data))

-- Lets send back client coords to the React frame for use
  local curCoords = GetEntityCoords(PlayerPedId())

  local retData <const> = { x = curCoords.x, y = curCoords.y, z = curCoords.z }
  cb(retData)
end)

RegisterNetEvent('vtest:client:menutest', function()

end)
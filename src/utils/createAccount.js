const { generatePassword } = require('./password');
const { v4 } = require('uuid');

const createSignup = (emailID, role, companyName, serviceCountry, residentCountry) => {
  let payload = {
    "username": emailID,
    "userAttributes": [
      { "Name": "custom:ggl-id", "Value": v4() },
      { "Name": "custom:roles", "Value": role },
      { "Name": "email", "Value": emailID },
      { "Name": "email_verified", "Value": "true" },
      { "Name": "custom:employer", "Value": "" },
      { "Name": "custom:companyName", "Value": companyName },
      { "Name": "custom:supplierName", "Value": companyName },
      { "Name": "custom:residentCountry", "Value": residentCountry },
      { "Name": "custom:serviceCountry", "Value": serviceCountry }],
    "desiredDeliveryMediums": [
      "EMAIL"
    ],
    "forceAliasCreation": true,
    "temporaryPassword": generatePassword()
  };
  let usernameData = fetch(process.env.NEXT_PUBLIC_EVL_API_ENDPOINT+'/user/auth/admin/admin-create-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-evl-client-id': process.env.NEXT_PUBLIC_EVL_CLIENT_ID,
      'x-evl-client-secret': process.env.NEXT_PUBLIC_EVL_CLIENT_SECRET,
      'userservice-api-key': process.env.NEXT_PUBLIC_EVL_API_KEY
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      return data.User.Username;
    })
    .catch(error => {
      console.error('Error:', error);
      return "";
    });
  return usernameData
};

export {createSignup};

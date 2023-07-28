import AWS from 'aws-sdk/global';
import { CognitoIdentityServiceProvider } from 'aws-sdk/clients/cognitoidentityserviceprovider';
AWS.config.update({accessKeyId:process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID, secretAccessKey:process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY});
const { generatePassword } = require('./password');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_AWS_USERPOOL_ID,
    clientId: process.env.NEXT_PUBLIC_AWS_CLIENT_ID
  });

  const listGroups = async () => {
    try {
      const params = {
        UserPoolId: process.env.NEXT_PUBLIC_AWS_USERPOOL_ID,
        Limit: 10
      };
      const data = await cognitoIdentityServiceProvider.listGroups(params).promise();
      console.log('Userpool Groups List recieved correctly')
      const roleListData = data.Groups.map(group => group.GroupName.replace('role:', ''));
      return roleListData;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const addUserToGroup = async(groupName, username) => {
    try {
    const params = {
      UserPoolId: process.env.NEXT_PUBLIC_AWS_USERPOOL_ID,
      GroupName: "role:" + groupName,
      Username: username
    };

    const data =await cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
    console.log(data);
    return true
  }catch (error) {
    console.error('Error:', error);
    return false;
  }
  };

  const resetCognitoPassword = async(username,forceResetFlag) => {
    try {
    const params = {
      Password: generatePassword(),
      Permanent: forceResetFlag,
      Username: username,
      UserPoolId: process.env.NEXT_PUBLIC_AWS_USERPOOL_ID
    };

    const data =await cognitoIdentityServiceProvider.adminSetUserPassword(params).promise();
    console.log(data);
    return true
  }catch (error) {
    console.error('Error:', error);
    return false;
  }
  };

export {listGroups,addUserToGroup,resetCognitoPassword};

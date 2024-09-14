# ChatApp

ChatApp is React-Node application that allow sending messages between users simultaneously encrypting messages. To encrypt messages I have used npm package named "@privacyresearch/libsignal-protocol-typescript". All messages are encrypted and stored in database. Application doesn't have implemented adding user by react user interface yet. So to test the application you can register 2 accounts, then 4example run MongoDB Compass and read id's both of accounts. Then in React you can invoke manually socket.emit("addFriend",{userId: yourId, friendId: friendId}) <- invoke that method and then switch yourId with friendId invoking method once again so both of users have each other as friends. In some time I will implement adding user, so there will not be need of adding friends manually like I've mentioned before. Application has problem when switching between contact list. So for example, when you select first contact from the list and then switch to second one- error appears (identity key changed). At the moment I can not fix that problem because I do not know exactly how to fix it. But overall if you just refresh the page and select second contact, the ability to send messages / receive messages should be ok. Feel free to watch the Demo of application.

# 📺Demo
[Watch Me](https://youtu.be/zvmti8d48_E)


## 👇Features

- Storing encrypted messages in MongoDB database
- Encrypting messages
- Decrypting messages

## &#127775; Value
1. Enhanced privacy and security: End-to-end encryption ensures that only the sender and recipient can read the messages, preventing unauthorized access third parties, or even the service provider.
2. Protection against data breaches: Encrypted messaging safeguards sensitive information, such as personal details or business secrets, reducing the risk of exposure during data breaches or cyberattacks.
3. Trust and confidence: Users are more likely to trust and use a chat application that guarantees their messages are secure, leading to higher user satisfaction and loyalty
4. Preventing eavesdropping: Encryption ensures that even if a message is intercepted during transmission, it remains unreadable without the encryption key, protecting users from potential surveillance or eavesdropping by malicious actors.

## 💡Tech
![image](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![image](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![image](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white)
![image](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![image](https://img.shields.io/badge/Material%20UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)

## 💿Installation

ChatApp requires [NodeJS](https://nodejs.org/) v22.3.0 to run.

ChatApp requires [ReactJS](https://react.dev/) v18.3.1 to run.

ChatApp requires [Npm](https://www.npmjs.com/) v10.8.1 to run.

ChatApp requires [MongoDB](https://www.mongodb.com/) v7.0.11 to run.

Install the dependencies and devDependencies.

From root directory:
```sh
npm i
npm start
```

From root directory:

```sh
cd client
npm i
npm start
```

## 🙋‍♂️Author
[Contact Me](https://www.linkedin.com/in/bartosz-gabruś/)

[@strejcik](https://www.github.com/strejcik)

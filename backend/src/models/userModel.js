const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../../data/users.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(usersFilePath))) {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
}
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

const readUsers = () => {
  const data = fs.readFileSync(usersFilePath, 'utf8');
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const findUserByUsername = (username) => {
  const users = readUsers();
  return users.find(u => u.username === username);
};

const createUser = async (username, hashedPassword) => {
  const users = readUsers();
  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeUsers(users);
  return newUser;
};

module.exports = { findUserByUsername, createUser };
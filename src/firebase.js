import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDLhn7HOFSp0KgNoT3t6Evyt-IHwyxQDpQ',
  authDomain: "tododb-b9f71-default-rtdb.firebaseio.com",
  databaseURL: "https://tododb-b9f71-default-rtdb.firebaseio.com",
  projectId: "tododb-b9f71",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

export default db;
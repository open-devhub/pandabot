const { db } = require('../config/firebase.js');
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} = require('firebase/firestore');

function createDocument(collection, documentId, data) {
  const documentRef = doc(db, collection, documentId);
  return setDoc(documentRef, data);
}

function deleteDocument(collection, documentId) {
  const documentRef = doc(db, collection, documentId);
  return deleteDoc(documentRef);
}

function getDocument(collection, documentId) {
  const documentRef = doc(db, collection, documentId);
  return getDoc(documentRef);
}

function updateDocument(collection, documentId, data) {
  const documentRef = doc(db, collection, documentId);
  return updateDoc(documentRef, data);
}

module.exports = {
  createDocument,
  deleteDocument,
  getDocument,
  updateDocument,
};

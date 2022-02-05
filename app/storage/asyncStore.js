import AsyncStorage from '@react-native-async-storage/async-storage';
import Choice from '../choice';
import Wheel from '../wheel';

const SAVED_WHEELS_ITEM = 'savedWheels';
const SAVED_CHOICES_ITEM = 'savedChoices';

//////////////// Choices

export async function getSavedChoices() {
  const savedData = await AsyncStorage.getItem(SAVED_CHOICES_ITEM)
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error getting saved choices', error));
  if (savedData !== null) {
    return savedData;
  } else {
    return [];
  }
}

// export async function getSavedChoice(id) {
//   return await getSavedChoices()
//     .then(savedChoices => savedChoices[id])
//     .catch(error => console.error('Error getting saved choice', error));
// }

export async function updateChoice(updatedChoice) {
  const savedChoices = await getSavedChoices();
  savedChoices[updatedChoice.id] = updatedChoice;
  await AsyncStorage.setItem(SAVED_CHOICES_ITEM, JSON.stringify(savedChoices));
}

export async function saveNewChoice(choice) {
  let savedChoices = await AsyncStorage.getItem(SAVED_CHOICES_ITEM)
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error setting saved choices', error));
  if (savedChoices === null) {
    savedChoices = [];
  }
  const currentTime = new Date().toLocaleString();
  const id = savedChoices.length;
  const newChoice = new Choice(id, choice, currentTime, '');
  savedChoices.push(newChoice);
  await AsyncStorage.setItem(SAVED_CHOICES_ITEM, JSON.stringify(savedChoices));
}

export async function deleteChoices() {
  await AsyncStorage.removeItem(SAVED_CHOICES_ITEM);
}

//////////////// Wheels

export async function getSavedWheels() {
  const savedData = await AsyncStorage.getItem(SAVED_WHEELS_ITEM)
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error getting saved wheels', error));
  if (savedData !== null) {
    return savedData;
  } else {
    return [];
  }
}

export async function saveNewWheel(name, choices) {
  let savedWheels = await AsyncStorage.getItem(SAVED_WHEELS_ITEM)
    .then(req => JSON.parse(req))
    .catch(error => console.error('Error setting saved wheels', error));
  if (savedWheels === null) {
    savedWheels = [];
  }
  const id = savedWheels.length;
  const newWheel = new Wheel(id, name, choices);
  console.log('new wheels: ', newWheel);
  savedWheels.push(newWheel);
  await AsyncStorage.setItem(SAVED_WHEELS_ITEM, JSON.stringify(savedWheels));
}

export async function deleteWheels() {
  await AsyncStorage.removeItem(SAVED_WHEELS_ITEM);
}

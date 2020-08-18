
import faker from 'faker';
const createIRValue = () => ({
  id: faker.random.uuid(),
  value: faker.name.findName(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.past().toISOString(),
});

const createCommand = () => ({
  id: faker.random.uuid(),
  name: faker.name.findName(),
  description: faker.random.words(),
  updatedAt: faker.date.past().toISOString(),
  createdAt: faker.date.past().toISOString()
});

const createRemoteControl = () => ({
  id: faker.random.uuid(),
  name: faker.name.findName(),
  description: faker.random.words(),
  updatedAt: faker.date.past().toISOString(),
  createdAt: faker.date.past().toISOString()
});

const createIRValues = (numUsers = 5) =>
  new Array(numUsers).fill(undefined).map(createIRValue);
const createCommands = (numUsers = 5) =>
  new Array(numUsers).fill(undefined).map(createCommand);
const createRemoteControls = (numUsers = 5) =>
  new Array(numUsers).fill(undefined).map(createRemoteControl);

export const fakeIRValues = createIRValues(3);
export const fakeCommands = createCommands(2);
export const fakeRemoteControls = createRemoteControls(5);

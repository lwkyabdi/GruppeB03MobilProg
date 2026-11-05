jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    Link: Text,
    router: { push: jest.fn(), navigate: jest.fn(), back: jest.fn() },
    useLocalSearchParams: () => ({ id: '603' }),
  };
});

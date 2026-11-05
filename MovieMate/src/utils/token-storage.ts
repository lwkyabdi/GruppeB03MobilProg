import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const key = 'moviemate-session';
// Web preview keeps the token in memory; persistent sign-in is native only.
let webToken: string | null = null;
export const getToken = () =>
  Platform.OS === 'web'
    ? Promise.resolve(webToken)
    : SecureStore.getItemAsync(key);
export const saveToken = (token: string) =>
  Platform.OS === 'web'
    ? Promise.resolve(void (webToken = token))
    : SecureStore.setItemAsync(key, token);
export const clearToken = () =>
  Platform.OS === 'web'
    ? Promise.resolve(void (webToken = null))
    : SecureStore.deleteItemAsync(key);

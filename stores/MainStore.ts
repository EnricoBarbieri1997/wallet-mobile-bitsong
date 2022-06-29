import { DApp, User } from "classes";
import { makeAutoObservable } from "mobx";
import SettingsStore from "./SettingsStore";
import WalletStore from "./WalletStore";
import CoinStore from "./CoinStore";
import RemoteConfigsStore from "./RemoteConfigsStore";
import DappConnectionStore from "./DappConnectionStore";
import ContactsStore from "./ContactsStore";

export default class MainStore {
  auth = null;
  configs = {
    remote: new RemoteConfigsStore(),
  };
  wallet = new WalletStore(this.configs.remote);
  settings = new SettingsStore();
  coin = new CoinStore(this.wallet, this.configs.remote);
  dapp = new DappConnectionStore(this.wallet);

  user: null | User = new User(); //  null;
  contacts = new ContactsStore();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }
}

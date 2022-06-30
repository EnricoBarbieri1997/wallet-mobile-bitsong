import { IPerson } from "classes/types";
import { makeAutoObservable } from "mobx";
import { InputHandler } from "utils";

export default class ContactsStore {
  persons: IPerson[] = [
    {
      _id: "1",
      avatar: "",
      firstName: "A",
      lastName: "Delogu",
      nickname: "Delogu",
      address: "1234567fdghjlkj5678",
    },
    {
      _id: "2",
      avatar: "",
      firstName: "M",
      lastName: "Vacchi",
      nickname: "Vacchi",
      address: "1234567fdghjlkj5678",
    },
    {
      _id: "3",
      avatar: "",
      firstName: "L",
      lastName: "Aleandri",
      nickname: "Aleandri",
      address: "1234567fdghjlkj5678",
    },
    {
      _id: "4",
      avatar: "",
      firstName: "A",
      lastName: "Rossi",
      nickname: "Rossi",
      address: "1234567fdghjlkj5678",
    },
  ];

  favorites = new Set<IPerson["_id"]>();
  inputSearch = new InputHandler();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private get filterdPersons() {
    const { inputSearch, persons } = this;
    if (inputSearch.value) {
      const lowerCase = inputSearch.value.toLowerCase();
      return persons.filter(({ nickname }) =>
        nickname.toLowerCase().includes(lowerCase)
      );
    } else {
      return persons;
    }
  }

  get sectionsData() {
    type ContactsSection = {
      label: string;
      data: IPerson[];
    };

    const { filterdPersons, favorites } = this;

    const favoritesData: ContactsSection = {
      label: "Favorite",
      data: filterdPersons.filter((person) => favorites.has(person._id)),
    };

    const records = filterdPersons.reduce((records, person) => {
      const key = person.nickname[0].toUpperCase();

      if (records[key]) {
        records[key].push(person);
      } else {
        records[key] = [person];
      }

      return records;
    }, {} as { [key: string]: IPerson[] });

    const allData: ContactsSection[] = Object.keys(records)
      .sort()
      .map((key) => ({
        label: key,
        data: records[key],
      }));

    return favoritesData.data.length > 0
      ? [favoritesData, ...allData]
      : allData;
  }

  add(person: IPerson) {
    this.persons.push(person);
  }

  delete(person: IPerson) {
    const index = this.persons.findIndex(({ _id }) => person._id === _id);

    if (index >= 0) {
      this.persons.splice(index, 1);
      this.favorites.delete(person._id);
    }
  }

  addToFavorites(person: IPerson) {
    this.favorites.add(person._id);
  }
}

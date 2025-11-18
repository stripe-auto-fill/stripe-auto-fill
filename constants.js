const FIRST_NAMES = [
  "Takudzwa", "Tendai", "Tinashe", "Tanaka", "Tapiwa", "Tafadzwa", "Tatenda", "Tarirai",
  "Chipo", "Chiedza", "Chenai", "Chengeto", "Charity", "Charmaine", "Cynthia", "Catherine",
  "Rumbidzai", "Rudo", "Rutendo", "Rufaro", "Ruvarashe", "Ruvimbo", "Runako",
  "Kudakwashe", "Kudzai", "Kundai", "Kumbirai", "Kudzanai", "Kudzaishe", "Kuzivakwashe",
  "Nyasha", "Nyarai", "Nyaradzo", "Ngoni", "Nokutenda", "Nomatter", "Noticia", "Noreen",
  "Munashe", "Munyaradzi", "Mutsa", "Mufaro", "Muchaneta", "Mudavanhu", "Mudiwa",
  "Simbarashe", "Simukai", "Simba", "Samuel", "Sharon", "Shingi", "Shingai", "Sekai",
  "Brian", "Brandon", "Benedict", "Blessed", "Blessing", "Brighton", "Bernard", "Bruce",
  "Alice", "Angela", "Anna", "Adelaide", "Agatha", "Amanda", "Anastasia", "Agnes",
  "David", "Daniel", "Darlington", "Dennis", "Dylan", "Desmond", "Douglas", "Donald"
];

const LAST_NAMES = [
  "Moyo", "Ncube", "Sibanda", "Dube", "Ndlovu", "Mpofu", "Khumalo", "Nkomo",
  "Zhou", "Mutasa", "Chikwanha", "Gwede", "Gumbo", "Mahlangu", "Mlilo", "Tshuma",
  "Chiwenga", "Chiweshe", "Chigumbura", "Chikomo", "Chikunda", "Chidzonga",
  "Nyathi", "Nyoni", "Nyoka", "Ngwenya", "Nkala", "Ndiweni", "Nduna",
  "Marufu", "Marowa", "Mapfumo", "Madondo", "Mavhima", "Madziva", "Mazuru",
  "Sithole", "Shumba", "Shoko", "Shava", "Shiri", "Sigauke", "Simango",
  "Banda", "Bhebhe", "Bvuma", "Chikomba", "Chirara", "Choto", "Chombo",
  "Mlambo", "Mlalazi", "Mtshali", "Mukono", "Mukwashi", "Musarurwa",
  "Zulu", "Zondo", "Zvobgo", "Zivhu", "Zimuto", "Ziki", "Zvinavashe"
];

const EXTENSION_NAME = 'Stripe Auto Fill';
const EXTENSION_VERSION = '5.0';
const FIXED_ADDRESS = 'Recto Avenue';
const FIXED_CITY = 'Manila';
const FIXED_ZIP = '1001';
const FIXED_STATE = 'Metro Manila';
const DEFAULT_COUNTRY = 'PH';
const DEFAULT_CARD_QUANTITY = 10;
const DEFAULT_BIN = '552461';

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomData() {
  return {
    name: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
    address: FIXED_ADDRESS,
    address2: '',
    city: FIXED_CITY,
    zip: FIXED_ZIP,
    state: FIXED_STATE
  };
}


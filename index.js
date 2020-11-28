const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

const FLIGHT_ORIGIN = 'YTO'; // IATA code for Toronto
const tequilaApiKey = process.env.TEQUILA_API_KEY;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

let today = new Date();
let targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 60);

const TWO_MONTHS = `${targetDate.getDate()}/${
  targetDate.getMonth() + 1
}/${targetDate.getFullYear()}`;

const TODAY = `${String(today.getDate()).padStart(2, '0')}/${String(
  today.getMonth() + 1
).padStart(2, '0')}/${today.getFullYear()}`;

let tequilaApi = axios.create({
  baseURL: 'https://tequila-api.kiwi.com/v2',
});

let sheetyApi = axios.create({
  baseURL: 'https://api.sheety.co',
});

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.get('/deals', async (req, res) => {
  let sheetResponse = await sheetyApi.get(
    '/98fafcacb47800b43ccb00d084b6dc97/flightDeals/prices'
  );

  let cities = sheetResponse.data.prices;

  cities.map(async (city) => {
    let flightResponse = await tequilaApi.get(
      `/search?fly_from=${FLIGHT_ORIGIN}&fly_to=${city.iataCode}&dateFrom=${TODAY}&dateTo=${TWO_MONTHS}&apikey=${tequilaApiKey}`
    );

    flightResponse.data.data.map((flight) => {
      if (city.lowestPrice > flight.price) {
        // TWILIO
        // client.messages
        //   .create({
        //     body: `Cheap flight found! Flying from ${flight.flyFrom} to ${flight.flyTo} costs ${flight.price}. The minimum you want to spend is ${city.lowestPrice}`,
        //     from: '+16479050049',
        //     to: '+14373444787',
        //   })
        //   .then((message) => console.log(message.sid));

        console.log(
          `Cheap flight found! Flying from ${flight.flyFrom} to ${flight.flyTo} costs ${flight.price}. The minimum you want to spend is ${city.lowestPrice}`
        );
      }
    });
  });

  res.send('Deals!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);

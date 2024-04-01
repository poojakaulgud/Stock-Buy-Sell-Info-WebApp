const express = require("express");
const cors = require('cors');
const path = require('path');
var moment = require('moment-timezone');
const axios = require('axios');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
app.use(cors({
  origin: 'http://localhost:4200' 
}));
app.use(express.json());
app.use(bodyParser.json());
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://pkaulgud:Pooja16@cluster0.taxecnq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to your Atlas cluster
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Successfully connected to Atlas");
        const database = client.db('assgn3'); 
        const collection = database.collection('watchlist'); 
      
        // Create
        app.post('/watchlist', async (req, res) => {
            const document = req.body;
            const result = await collection.insertOne(document);
            res.json(result);
        });

        // Read
        app.get('/watchlist', async (req, res) => {
            const watchlist = await collection.find({}).toArray();
            res.json(watchlist);
        });

        // Find
        app.get('/watchlist/:sts', async (req, res) => {
          const ticker = req.params.sts;
          try{
            
          const watchlist = await collection.findOne({ ticker: ticker });
          
          if (watchlist) {
            res.json(watchlist);
          } else {
            res.status(404).json({ message: "Item not found" });
          }
        } catch (error) {
          console.error('Error finding the document:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

        // Update
        app.put('/watchlist/:sts', async (req, res) => {
          const ticker = req.params.sts;
          const item = req.body;
          console.log(item)

          try {
            const result = await collection.updateOne(
              { ticker: ticker },
              { $set: item } 
            );
        
            if (result.matchedCount === 0) {
              return res.status(404).send({ message: "Item not found with ticker: " + ticker });
            }
        
            res.send({ message: "Item updated successfully", result: result });
          } catch (error) {
            console.error("Failed to update item with ticker " + ticker + ": ", error);
            res.status(500).send({ message: "Error updating item" });
          }
        });

        // Delete
        app.delete('/watchlist/:sts', async (req, res) => {
          const ticker = req.params.sts;
          console.log(ticker)
          const result = await collection.deleteOne({ ticker: ticker });
          if (result.deletedCount === 0) {
              res.status(404).json({ message: 'Document with the specified ticker not found' });
          } else {
              res.json({ message: 'Document deleted successfully' });
          }
        });



        const portfolio = database.collection('portfolio');
        const wallet = database.collection('wallet'); 
      
        // PORTFOLIO Create
        app.post('/portfolio', async (req, res) => {
            const document = req.body;
            const result = await portfolio.insertOne(document);
            res.json(result);
        });

        // PORTFOLIO Read
        app.get('/portfolio', async (req, res) => {
            const result = await portfolio.find({}).toArray();
            res.json(result);
        });

        app.get('/wallet', async (req, res) => {
          const result = await wallet.find({}).toArray();
          res.json(result);
      });

        // Portfolio Find
        app.get('/portfolio/:sts', async (req, res) => {
          const ticker = req.params.sts;
          try{
            
          const result = await portfolio.findOne({ ticker: ticker });
          
          if (result) {
            res.json(result);
          } else {
            res.status(404).json({ message: "Item not found" });
          }
        } catch (error) {
          console.error('Error finding the document:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

        // Portfolio Update
        app.put('/portfolio/:sts', async (req, res) => {
          const ticker = req.params.sts;
          const item = req.body;
          console.log(item)

          try {
            const result = await portfolio.updateOne(
              { ticker: ticker },
              { $set: item } 
            );
        
            if (result.matchedCount === 0) {
              return res.status(404).send({ message: "Item not found with ticker: " + ticker });
            }
        
            res.send({ message: "Item updated successfully", result: result });
          } catch (error) {
            console.error("Failed to update item with ticker " + ticker + ": ", error);
            res.status(500).send({ message: "Error updating item" });
          }
        });

        app.put('/wallet/:balance', async (req, res) => {
          const balance = req.params.balance;

          try {
            const result = await wallet.updateOne(
              { _id: new ObjectId('660536ad692bac27edd7d7ef') },
              { $set: {"balance":Number(balance)} } 
            );
        
            if (result.matchedCount === 0) {
              return res.status(404).send({ message: "Item not found with ticker: " + balance });
            }
        
            res.send({ message: "Item updated successfully", result: result });
          } catch (error) {
            console.error("Failed to update item with balance " + balance + ": ", error);
            res.status(500).send({ message: "Error updating item" });
          }
        });

        // Portfolio Delete
        app.delete('/portfolio/:sts', async (req, res) => {
          const ticker = req.params.sts;
          console.log(ticker)
          const result = await portfolio.deleteOne({ ticker: ticker });
          if (result.deletedCount === 0) {
              res.status(404).json({ message: 'Document with the specified ticker not found' });
          } else {
              res.json({ message: 'Document deleted successfully' });
          }
        });

    } catch (err) {
        console.log(err.stack);
    }
    // finally {
    //     await client.close();
    // }
}

run().catch(console.dir);


const api_key = 'cn0rpthr01quegsk3600cn0rpthr01quegsk360g'
const polygon_key='pt2292F4rhnCRSfbEE5ot0QRFy0gvwMM'
app.listen(PORT,() => console.log("Server listening at port 3000"));








app.use(express.static(path.join(__dirname, 'assgn3/dist/assgn3')));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'assgn3/dist/assgn3/index.html'));
// });



// Route to handle incoming requests with a parameter
app.get('/description/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${sts}&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/quote/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${sts}&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/autocomplete/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/search?q=${sts}&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.get('/news/:sts', async (req, res) => {
//   const sts = req.params.sts;
//   console.log('here',sts);
  
//   try {
//     const to = moment().format('YYYY-MM-DD');
//     const from = moment().subtract(1,'week').format('YYYY-MM-DD');

//     // Call external API with the provided sts
//     const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2023-08-15&to=2023-08-20&token=cn0rpthr01quegsk3600cn0rpthr01quegsk360g`);
//     console.log('CHECK HEEREEEEEEEE')
//     console.log(response);

    
 
//     // Send the fetched data back to the frontend
//     res.json(response.data);
//     console.log('RES',response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/news/:sts', async (req, res) => {
  try {
      const sts = req.params.sts;
      
      const toDate = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
      const fromDate = moment().tz("America/Los_Angeles").subtract(1, 'week').format('YYYY-MM-DD');
      
      const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${sts}&from=${fromDate}&to=${toDate}&token=${api_key}`);
      const newsWithImages = [];

      // Iterate over the response data and include only items with valid images
      let count=0;
      for (const newsItem of response.data) {
          if (newsItem.image && newsItem.image !== '') {
              newsWithImages.push(newsItem);
              count+=1;
              if(count===20){
                break;
              }
          }
      }
      res.json(newsWithImages);
      // res.json(response.data);
  
  } catch (error) {
      console.error('Error fetching company news:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/recommendation/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${sts}&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/sentiment/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${sts}&from=2022-01-01&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/peers/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${sts}&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/stock_price/:sts/:api_to', async (req, res) => {
  const sts = req.params.sts.toUpperCase();
  console.log('here',sts);
  const api_to = req.params.api_to;
  const api_from = moment(api_to).subtract(1, "days").format("YYYY-MM-DD");
  // const api_to = '2024-03-23';
  // const api_from = '2024-03-22';
  // console.log(api_to, api_from);
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${sts}/range/1/hour/${api_from}/${api_to}?adjusted=true&sort=asc&apiKey=${polygon_key}`);
    
    // Send the fetched data back to the frontend
    res_data = response.data.results
    let stock_price_data = {};
    let array1 = [];

    res_data.forEach(object => {
        array1.push([object['t'], object['c']]);
    });
    stock_price_data['StockPrice'] = array1;
    console.log(stock_price_data)
    res.json(stock_price_data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/chart/:sts', async (req, res) => {
  const sts = req.params.sts.toUpperCase();
  console.log('here',sts);
  const chart_to = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');;
  const chart_from = moment(chart_to).tz("America/Los_Angeles").subtract(2, "years").format("YYYY-MM-DD");
  // const api_to = '2024-03-23';
  // const api_from = '2024-03-22';
  // console.log(api_to, api_from);
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${sts}/range/1/day/${chart_from}/${chart_to}?adjusted=true&sort=asc&apiKey=${polygon_key}`);
    
    // Send the fetched data back to the frontend
    res_data = response.data.results
    
    res.json(res_data);
    // console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/earnings/:sts', async (req, res) => {
  const sts = req.params.sts;
  console.log('here',sts);
  
  try {
    // Call external API with the provided sts
    const response = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${sts}&token=${api_key}`);
    
    // Send the fetched data back to the frontend
    res.json(response.data);
    console.log('RES',response.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});















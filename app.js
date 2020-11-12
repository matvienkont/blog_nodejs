const express = require("express")
const exphbs = require("express-handlebars")
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require('method-override')
const Handlebars = require("handlebars")
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")
const { checkUser } = require("./middleware/authMiddleware")

const app = express()

require("dotenv").config()

//Map global promise - get rid of deprecation message
mongoose.Promise = global.Promise

//Set the app to use the handlebars engine
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs())

Handlebars.registerHelper('links_counter', function(n, block) {
		var accum = '';
		for(var i = 0; i <= n; ++i)
		{
			accum += block.fn(`<a class="page-links card" href="/posts?page=${i}">${i+1}</a>`);
		}
		return accum;
	
});

//Middleware for PUT || DELETE methods
app.use(methodOverride('_method'));

//Use static files
app.use(express.static(path.join(__dirname, "/public")))


//Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

// 


//Load routes
const posts = require('./routes/posts');
const users = require('./routes/users');
const profile = require('./routes/profile');
//Connect to mongoose
mongoose
	.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/blog`, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.log(err));

//Server listening
const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});

//Base page
app.get('/', checkUser, (req, res) => {
	res.render('index');
});

//About page
app.get('/about', checkUser, (req, res) => {
	res.render('about');
})

//Use posts.js export module to /posts route
app.use('/posts', posts);

//Use users.js export module to /users route
app.use('/users', users);

//Use profile.js export module to /profile route
app.use('/profile', profile);

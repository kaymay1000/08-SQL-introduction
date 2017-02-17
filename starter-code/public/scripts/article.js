'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method pushes the Article objects into the Article.all array in order
 from newest to oldest.
 * - Inputs: arbitrarily named argument "rows", which represents
 an array of Article objects/records from the DB, and arguments "a", "b", and
 * "ele" which each represent an individual Article object from the DB.
 * - Outputs: the subtraction of two Date objects (ultimately a number of milliseconds).
 */
Article.loadAll = function(rows) {
  // DONE: describe what the following code is doing
  //Takes two objects from the database, creates two new Date objects using the
  //values of the objects' publishedOn properties, and subtracts/compares the two
  //in order to figure out which object is newest and put them in chronological order.
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: describe what the following code is doing
  //Takes each object (represented by "ele") in the "rows" that are passed in,
  //and uses its key:value pairs to create a new Article object, then pushes it
  //into the Article.all array.
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Makes an AJAX GET request to the /articles route of the Blog.
 * - Inputs: a callback function which runs after Article.loadAll is executed. (Other
 * inputs explained below.)
 * - Outputs: None
 */
Article.fetchAll = function(callback) {
  // DONE: describe what the following code is doing
  //Makes an AJAX request to the server for the content at the route, '/articles'
  $.get('/articles')
  // DONE: describe what the following code is doing
  //After a response is sent back from the server, a function that takes "results"
  //as an argument checks if the body of the response (in this case, the records in
  //the DB), has any content (a length > 0).
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: describe what the following code is doing
        //Passes results (the body of the response) into loadAll and calls it,
        //then calls "callback", which is really a placeholder name for
        //articleView.initIndexPage. Article.fetchAll is called in index.html,
        //and articleView.initIndexPage is its argument.
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // DONE: describe what the following code is doing
        //Makes another AJAX request to the server for the content found at the
        //./data/hackerIpsum.json route. Once content is returned, a function that
        //takes "rawData" as an argument (which represents the body of the request/all
        //of the JSON objects found in hackerIpsum.json), creates a new Article out
        //of each individual JSON object (represented by "item"), and assigns it to a
        //variable called "article". Then insertRecord() is called on "article", which
        //adds the newly created Article object to the DB.
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: describe what the following code is doing
        //Calls Article.fetchAll(callback), which is really like calling
        //Article.fetchAll(articleView.initIndexPage).
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: describe what the following code is doing
        //Throws an error if the $.getJSON request fails
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Makes an AJAX DELETE request to the /articles route of the Blog to delete
 * all data from the database, but leaves the table structure intact.
 * - Inputs: a callback function called "callback"
 * - Outputs: None
 */
Article.truncateTable = function(callback) {
  // DONE: describe what the following code is doing
  //Makes an AJAX DELETE request to the server for the content at the /articles route
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: describe what the following code is doing
  //Console logs the response body, then calls the callback function
  //(represented by placeholder, "callback") if one is provided.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Makes an AJAX POST request to server.js for the /articles route of the Blog.
 * - Inputs: a callback function called "callback"
 * - Outputs: None
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: describe what the following code is doing
  //Makes a $.post request to the server, and provides the server with
  //the data it needs to execute the SQL command found in app.post('/articles').
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: describe what the following code is doing
  //Console logs the response body, then calls the callback function
  //(represented by placeholder, "callback") if one is provided.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Tells the server which record to delete when it recieves an AJAX DELETE request
 * to the /articles/:id route.
 * - Inputs: a callback function called "callback"
 * - Outputs: None
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: describe what the following code is doing
  //Makes an AJAX DELETE request to the server with a url whose /:id parameter
  //corresponds with a particular record's article_id/primary key.
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: describe what the following code is doing
  //Console logs the response body, then calls the callback function
  //(represented by placeholder, "callback") if one is provided.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Updates a particlar record in the DB when an AJAX PUT request is sent to
 the /articles/:id route of the Blog.
 * - Inputs: a callback function called "callback"
 * - Outputs: none
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: describe what the following code is doing
  //Makes an AJAX PUT request to the /articles/:id route to update the particular
  //record associated with a specific article_id/primary key
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: describe what this object is doing
      //This object is setting the keys of a single Article object equal to
      //the keys of the current Article object
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: describe what the following code is doing
  //Console logs the response body, then calls the callback function
  //(represented by placeholder, "callback") if one is provided.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

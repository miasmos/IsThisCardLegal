var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');

var BannedRestrictedUpdater = function() {
	var self = this;
	this.requestOpts = {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36'
		}
	};

	this.baseURL = 'http://magic.wizards.com/en/gameinfo/gameplay/formats/';

	this.setURL = function(url) {
		this.requestOpts.url = this.baseURL+url;
		console.log('requesting '+this.requestOpts.url);
	}

	this.parseHTML = function(url, html, cb) {
		$ = cheerio.load(html);
		var basePage = url.indexOf('bannedrestricted') > -1;
		var data = {};
		$('#content .bean_block').map(function(i, link) {
			var div = $(link).find('.page-width');
			var title = $(div).find('h2').html();
			if (title) {	//found a valid block
				if ($(div).has('ul').length) {	//block has cards in it
					var temp = {};
					temp.banned = [];
					$(div).find('ul').first().find('li').map(function(j, link1) {	//iterate over banned cards
						temp.banned.push($(link1).find('a').text());
					});
				}
				if ($(div).find('ul').length > 1) {	//block has restricted cards
					temp.restricted = [];
					$(div).find('ul').last().find('li').map(function(j, link1) {	//iterate over restricted cards
						temp.restricted.push($(link1).find('a').text());
					});
				}
				if ($(div).has('ul').length) {
					if (basePage) {
						data[title] = temp;
					} else {
						data = temp;
					}
				}
			}
		});

		//search additional formats pages
		if (basePage) {
			var t = undefined, temp = [];
			$('#content .bean_block').last().find('.page-width .spacer p').map(function(i, link) {
				//get title
				var te = $(link).find('strong').length;
				if (te) {
					t = $(link).find('strong').text();
					return;
				}
				//get link
				var a = $(link).find('a').length;
				if (a) {
					if (t.indexOf('-') == -1) temp.push(t.replace(/\s/g, '').toLowerCase());
				}
			});
			data.links = temp;
		}
		if (!basePage) {
			data = [url.substring(url.lastIndexOf('/')+1,url.length),data];
		}
		cb(data);
	}

	this.getPage = function(url, cb) {
		var self = this;

		this.setURL(url);
		request(this.requestOpts, function(err, resp, html) {
			if (err) {
				console.error(err);
				self.getPage(url,cb);
			} else {
				self.parseHTML(url, html, function(json) {
					cb(err, json);
				});
			}
		});
	}

	this.Go = function() {
		var resp = 0, respmax = 0;
		self.getPage('bannedrestricted', function(err, data){
			resp++;
			data.links.push('commander');
			respmax = data.links.length;
			for (var link in data.links) {
				self.getPage(data.links[link], function(err, data1){
					resp++;
					if (data1[1]) {data[data1[0].toUpperCase()] = data1[1];}
					if (resp == respmax+1) {
						self.writeToFile(data);
					}
				});
			}
			delete data.links;
		});
	}

	this.writeToFile = function(data) {
		var output,sw=false;
		for (var format in data) {
			for (var type in data[format]) {
				output += format + '(' + type + ')' + ': ';
				for (var card in data[format][type]) {
					output += data[format][type][card] + ';';
					sw=true;
				}
				if (sw) output += '\r\n', sw=false;
			}
		}
		fs.writeFile('banned.txt',output);
	}
};

var test = new BannedRestrictedUpdater();
test.Go();

//module.exports = new BannedRestrictedUpdater();
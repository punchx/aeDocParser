const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const url = 'http://docs.aenhancers.com/';



axios.get(url).then(function(response) {

	let linksArr = [];

	const $ = cheerio.load(response.data);
	const links = $('.wy-menu-vertical ul li a');

	links.each(function() {
		linksArr.push($(this).attr('href').trim());
	});

 return linksArr;
}).then(function(linksArr) {

		for(var i = 0; i < linksArr.length; i++) {
			axios.get(url + 'layers/layer/').then(function(response) {
				let stream = fs.createWriteStream(path.resolve(__dirname, 'streamoutput.json'), {flags: 'a'});
				let obj = {};
				const $ = cheerio.load(response.data);
				const attrs = $('.wy-menu-vertical .current [href="#attributes"]').next().find('li a');
				const methods = $('.wy-menu-vertical .current [href="#methods"]').next().find('li a');

				attrs.each(function() {
					let trigger = $(this).text().split('.')[1];
					stream.write(JSON.stringify({trigger: trigger, contents: trigger}) + ',\n');
				});


				methods.each(function(){
					let trigger = $(this).text().split('.')[1].slice(0,-2);

					const param = $($(this).attr('href') + ' strong').filter(function() {
						return $(this).text().trim() === 'Parameters';
					}).parent().next().text().trim();

					let contents = !(param === 'None.') ? trigger + '($0)' : trigger + '()';
					stream.write(JSON.stringify({trigger: trigger, contents: contents}) + ',\n');
				});
				stream.end();
			})
		}
});



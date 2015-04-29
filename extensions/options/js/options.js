var Options = Backbone.Model.extend({
  initialize: function(browser, timeframes) {
    this.browser = browser;
    this.timeframes = timeframes;
    this.resetValues();
    this.getAllLogEntries();
    this.setUpCitizenship();
    this.toggleTimeframe(this.timeframes[0].name)
  },

  setUpCitizenship: function() {
    message.send({ countryLog: true });
  },

  receiveCitizenship: function(countryLog) {
    var countryCodes = _.pick(countryLog.visits, _.identity);
    var citizenship = this.calculatePercentages(countryCodes);
    this.set({ citizenship: citizenship });
  },

  calculatePercentages: function(data) {
    var sum = _.reduce(data, function(memo, num) { return memo + num; }, 0);
    var result = [];
    _.each(data, function(value, key) {
      var percentage = (value / sum) * 100;
      percentage = percentage.toFixed(2);
      result.push({ code: key, percentage: percentage });
    });
    result = _.sortBy(result, 'percentage');

    return result.reverse();
  },

  getCitizenshipForDays: function(n) {
    var entries = this.getTabEntriesForDays(n);
    var countryCodes = this.getPropertiesFromEntries(entries, 'countryCode');
    var citizenship = this.calculatePercentages(countryCodes);
    return citizenship;
  },

  getDomainsForDays: function(n) {
    var entries = this.getTabEntriesForDays(n);
    var domains = this.getPropertiesFromEntries(entries, 'domain');
    var domainPopularity = this.calculatePercentages(domains);
    return domainPopularity;
  },

  getPropertiesFromEntries: function(entries, property) {
    var validEntries = _.reject(entries, function(entry) {
      return entry[property] === undefined || entry[property] === '';
    });
    var countryCodes = _.countBy(validEntries, function(entry) {
      return entry[property];
    });
    return countryCodes;
  },

  getAllLogEntries: function() {
    message.send({ allLogEntries: true });
  },

  receiveAllLogEntries: function(entries) {
    var logEntries = _.map(entries, function(entry) {
      var logEntry = new LogEntry();
      return logEntry.fromJSON(entry);
    });

    if (!logEntries) {
      this.set({ logEntries: '' });
    } else {
      this.set({ logEntries: logEntries });
    }
  },

  getLogEntry: function(url) {
    var logEntries = this.get('logEntries');

    if (!logEntries) {
      return null;
    }

    var entries = _.filter(logEntries, function(logEntry) {
      return logEntry.url === url;
    });
    latestEntry = _.max(entries, function(entry) {
      return _.max(entry.timestamps);
    });
    return latestEntry;
  },

  getTabEntriesForDays: function(n) {
    if (n === null) {
      return this.get('logEntries');
    }

    var entries = this.get('logEntries');
    var cutOffDate = moment().subtract(n, 'days').valueOf();

    var latestEntries = _.filter(entries, function(entry) {
      return entry.latestTimestamp() <= cutOffDate;
    });
    return latestEntries;
  },

  resetValues: function() {
    this.set({ timeframe: this.timeframes[0] });
    this.set({ timeframeEntries: [], timeframeCitizenship: [], timeframeDomains: [] });
    this.set({ citizenship: [] });
    this.set({ entry: '' });
    this.unset('logEntries');
  },

  toggleTimeframe: function(name) {
    var timeframe = _.find(this.timeframes, function(tf) {
      return tf.name === name;
    });

    var entries = this.getTabEntriesForDays(this.get('timeframe').duration);
    var domains = this.getDomainsForDays(this.get('timeframe').duration);
    var citizenship = this.getCitizenshipForDays(this.get('timeframe').duration);
    this.set({
      timeframeCitizenship: citizenship,
      timeframeEntries: entries,
      timeframeDomains: domains,
      timeframe: timeframe
    });
  },

  eraseData: function() {
    this.resetValues();
    storage.clear();
  },

  convertCountryCode: function(countrycode) {
    if (countrycode == 'AF') { return 'Afghanistan'; }
    if (countrycode == 'AX') { return 'Aland Islands'; }
    if (countrycode == 'AL') { return 'Albania'; }
    if (countrycode == 'DZ') { return 'Algeria'; }
    if (countrycode == 'AS') { return 'American Samoa'; }
    if (countrycode == 'AD') { return 'Andorra'; }
    if (countrycode == 'AO') { return 'Angola'; }
    if (countrycode == 'AI') { return 'Anguilla'; }
    if (countrycode == 'AQ') { return 'Antarctica'; }
    if (countrycode == 'AG') { return 'Antigua and Barbuda'; }
    if (countrycode == 'AR') { return 'Argentina'; }
    if (countrycode == 'AM') { return 'Armenia'; }
    if (countrycode == 'AW') { return 'Aruba'; }
    if (countrycode == 'AU') { return 'Australia'; }
    if (countrycode == 'AT') { return 'Austria'; }
    if (countrycode == 'AZ') { return 'Azerbaijan'; }
    if (countrycode == 'BS') { return 'Bahamas'; }
    if (countrycode == 'BH') { return 'Bahrain'; }
    if (countrycode == 'BD') { return 'Bangladesh'; }
    if (countrycode == 'BB') { return 'Barbados'; }
    if (countrycode == 'BY') { return 'Belarus'; }
    if (countrycode == 'BE') { return 'Belgium'; }
    if (countrycode == 'BZ') { return 'Belize'; }
    if (countrycode == 'BJ') { return 'Benin'; }
    if (countrycode == 'BM') { return 'Bermuda'; }
    if (countrycode == 'BT') { return 'Bhutan'; }
    if (countrycode == 'BO') { return 'Bolivia'; }
    if (countrycode == 'BQ') { return 'Bonaire, Sint Eustatius and Saba'; }
    if (countrycode == 'BA') { return 'Bosnia and Herzegovina'; }
    if (countrycode == 'BW') { return 'Botswana'; }
    if (countrycode == 'BV') { return 'Bouvet Island'; }
    if (countrycode == 'BR') { return 'Brazil'; }
    if (countrycode == 'IO') { return 'British Indian Ocean Territory'; }
    if (countrycode == 'BN') { return 'Brunei Darussalam'; }
    if (countrycode == 'BG') { return 'Bulgaria'; }
    if (countrycode == 'BF') { return 'Burkina Faso'; }
    if (countrycode == 'BI') { return 'Burundi'; }
    if (countrycode == 'KH') { return 'Cambodia'; }
    if (countrycode == 'CM') { return 'Cameroon'; }
    if (countrycode == 'CA') { return 'Canada'; }
    if (countrycode == 'CV') { return 'Cabo Verde'; }
    if (countrycode == 'KY') { return 'Cayman Islands'; }
    if (countrycode == 'CF') { return 'Central African Republic'; }
    if (countrycode == 'TD') { return 'Chad'; }
    if (countrycode == 'CL') { return 'Chile'; }
    if (countrycode == 'CN') { return 'China'; }
    if (countrycode == 'CX') { return 'Christmas Island'; }
    if (countrycode == 'CC') { return 'Cocos (Keeling) Islands'; }
    if (countrycode == 'CO') { return 'Colombia'; }
    if (countrycode == 'KM') { return 'Comoros'; }
    if (countrycode == 'CG') { return 'Congo'; }
    if (countrycode == 'CD') { return 'Congo (Democratic Republic of the)'; }
    if (countrycode == 'CK') { return 'Cook Islands'; }
    if (countrycode == 'CR') { return 'Costa Rica'; }
    if (countrycode == 'CI') { return 'Cote d&apos;Ivoire'; }
    if (countrycode == 'HR') { return 'Croatia'; }
    if (countrycode == 'CU') { return 'Cuba'; }
    if (countrycode == 'CW') { return 'Curacao'; }
    if (countrycode == 'CY') { return 'Cyprus'; }
    if (countrycode == 'CZ') { return 'Czech Republic'; }
    if (countrycode == 'DK') { return 'Denmark'; }
    if (countrycode == 'DJ') { return 'Djibouti'; }
    if (countrycode == 'DM') { return 'Dominica'; }
    if (countrycode == 'DO') { return 'Dominican Republic'; }
    if (countrycode == 'EC') { return 'Ecuador'; }
    if (countrycode == 'EG') { return 'Egypt'; }
    if (countrycode == 'SV') { return 'El Salvador'; }
    if (countrycode == 'GQ') { return 'Equatorial Guinea'; }
    if (countrycode == 'ER') { return 'Eritrea'; }
    if (countrycode == 'EE') { return 'Estonia'; }
    if (countrycode == 'ET') { return 'Ethiopia'; }
    if (countrycode == 'FK') { return 'Falkland Islands (Malvinas)'; }
    if (countrycode == 'FO') { return 'Faroe Islands'; }
    if (countrycode == 'FJ') { return 'Fiji'; }
    if (countrycode == 'FI') { return 'Finland'; }
    if (countrycode == 'FR') { return 'France'; }
    if (countrycode == 'GF') { return 'French Guiana'; }
    if (countrycode == 'PF') { return 'French Polynesia'; }
    if (countrycode == 'TF') { return 'French Southern Territories'; }
    if (countrycode == 'GA') { return 'Gabon'; }
    if (countrycode == 'GM') { return 'Gambia'; }
    if (countrycode == 'GE') { return 'Georgia'; }
    if (countrycode == 'DE') { return 'Germany'; }
    if (countrycode == 'GH') { return 'Ghana'; }
    if (countrycode == 'GI') { return 'Gibraltar'; }
    if (countrycode == 'GR') { return 'Greece'; }
    if (countrycode == 'GL') { return 'Greenland'; }
    if (countrycode == 'GD') { return 'Grenada'; }
    if (countrycode == 'GP') { return 'Guadeloupe'; }
    if (countrycode == 'GU') { return 'Guam'; }
    if (countrycode == 'GT') { return 'Guatemala'; }
    if (countrycode == 'GG') { return 'Guernsey'; }
    if (countrycode == 'GN') { return 'Guinea'; }
    if (countrycode == 'GW') { return 'Guinea-Bissau'; }
    if (countrycode == 'GY') { return 'Guyana'; }
    if (countrycode == 'HT') { return 'Haiti'; }
    if (countrycode == 'HM') { return 'Heard Island and McDonald Islands'; }
    if (countrycode == 'VA') { return 'Holy See'; }
    if (countrycode == 'HN') { return 'Honduras'; }
    if (countrycode == 'HK') { return 'Hong Kong'; }
    if (countrycode == 'HU') { return 'Hungary'; }
    if (countrycode == 'IS') { return 'Iceland'; }
    if (countrycode == 'IN') { return 'India'; }
    if (countrycode == 'ID') { return 'Indonesia'; }
    if (countrycode == 'IR') { return 'Iran'; }
    if (countrycode == 'IQ') { return 'Iraq'; }
    if (countrycode == 'IE') { return 'Ireland'; }
    if (countrycode == 'IM') { return 'Isle of Man'; }
    if (countrycode == 'IL') { return 'Israel'; }
    if (countrycode == 'IT') { return 'Italy'; }
    if (countrycode == 'JM') { return 'Jamaica'; }
    if (countrycode == 'JP') { return 'Japan'; }
    if (countrycode == 'JE') { return 'Jersey'; }
    if (countrycode == 'JO') { return 'Jordan'; }
    if (countrycode == 'KZ') { return 'Kazakhstan'; }
    if (countrycode == 'KE') { return 'Kenya'; }
    if (countrycode == 'KI') { return 'Kiribati'; }
    if (countrycode == 'KP') { return 'Democratic People&apos;s Republic of Korea'; }
    if (countrycode == 'KR') { return 'Republic of Korea'; }
    if (countrycode == 'KW') { return 'Kuwait'; }
    if (countrycode == 'KG') { return 'Kyrgyzstan'; }
    if (countrycode == 'LA') { return 'Lao People&apos;s Democratic Republic'; }
    if (countrycode == 'LV') { return 'Latvia'; }
    if (countrycode == 'LB') { return 'Lebanon'; }
    if (countrycode == 'LS') { return 'Lesotho'; }
    if (countrycode == 'LR') { return 'Liberia'; }
    if (countrycode == 'LY') { return 'Libya'; }
    if (countrycode == 'LI') { return 'Liechtenstein'; }
    if (countrycode == 'LT') { return 'Lithuania'; }
    if (countrycode == 'LU') { return 'Luxembourg'; }
    if (countrycode == 'MO') { return 'Macao'; }
    if (countrycode == 'MK') { return 'Macedonia (Former Yugoslav Republic)'; }
    if (countrycode == 'MG') { return 'Madagascar'; }
    if (countrycode == 'MW') { return 'Malawi'; }
    if (countrycode == 'MY') { return 'Malaysia'; }
    if (countrycode == 'MV') { return 'Maldives'; }
    if (countrycode == 'ML') { return 'Mali'; }
    if (countrycode == 'MT') { return 'Malta'; }
    if (countrycode == 'MH') { return 'Marshall Islands'; }
    if (countrycode == 'MQ') { return 'Martinique'; }
    if (countrycode == 'MR') { return 'Mauritania'; }
    if (countrycode == 'MU') { return 'Mauritius'; }
    if (countrycode == 'YT') { return 'Mayotte'; }
    if (countrycode == 'MX') { return 'Mexico'; }
    if (countrycode == 'FM') { return 'Federated States of Micronesia'; }
    if (countrycode == 'MD') { return 'Moldova (Republic of)'; }
    if (countrycode == 'MC') { return 'Monaco'; }
    if (countrycode == 'MN') { return 'Mongolia'; }
    if (countrycode == 'ME') { return 'Montenegro'; }
    if (countrycode == 'MS') { return 'Montserrat'; }
    if (countrycode == 'MA') { return 'Morocco'; }
    if (countrycode == 'MZ') { return 'Mozambique'; }
    if (countrycode == 'MM') { return 'Myanmar'; }
    if (countrycode == 'NA') { return 'Namibia'; }
    if (countrycode == 'NR') { return 'Nauru'; }
    if (countrycode == 'NP') { return 'Nepal'; }
    if (countrycode == 'NL') { return 'Netherlands'; }
    if (countrycode == 'NC') { return 'New Caledonia'; }
    if (countrycode == 'NZ') { return 'New Zealand'; }
    if (countrycode == 'NI') { return 'Nicaragua'; }
    if (countrycode == 'NE') { return 'Niger'; }
    if (countrycode == 'NG') { return 'Nigeria'; }
    if (countrycode == 'NU') { return 'Niue'; }
    if (countrycode == 'NF') { return 'Norfolk Island'; }
    if (countrycode == 'MP') { return 'Northern Mariana Islands'; }
    if (countrycode == 'NO') { return 'Norway'; }
    if (countrycode == 'OM') { return 'Oman'; }
    if (countrycode == 'PK') { return 'Pakistan'; }
    if (countrycode == 'PW') { return 'Palau'; }
    if (countrycode == 'PS') { return 'Palestine'; }
    if (countrycode == 'PA') { return 'Panama'; }
    if (countrycode == 'PG') { return 'Papua New Guinea'; }
    if (countrycode == 'PY') { return 'Paraguay'; }
    if (countrycode == 'PE') { return 'Peru'; }
    if (countrycode == 'PH') { return 'Philippines'; }
    if (countrycode == 'PN') { return 'Pitcairn'; }
    if (countrycode == 'PL') { return 'Poland'; }
    if (countrycode == 'PT') { return 'Portugal'; }
    if (countrycode == 'PR') { return 'Puerto Rico'; }
    if (countrycode == 'QA') { return 'Qatar'; }
    if (countrycode == 'RE') { return 'Reunion'; }
    if (countrycode == 'RO') { return 'Romania'; }
    if (countrycode == 'RU') { return 'Russian Federation'; }
    if (countrycode == 'RW') { return 'Rwanda'; }
    if (countrycode == 'BL') { return 'Saint Barthelemy'; }
    if (countrycode == 'SH') { return 'Saint Helena, Ascension and Tristan da Cunha'; }
    if (countrycode == 'KN') { return 'Saint Kitts and Nevis'; }
    if (countrycode == 'LC') { return 'Saint Lucia'; }
    if (countrycode == 'MF') { return 'Saint Martin (French part)'; }
    if (countrycode == 'PM') { return 'Saint Pierre and Miquelon'; }
    if (countrycode == 'VC') { return 'Saint Vincent and the Grenadines'; }
    if (countrycode == 'WS') { return 'Samoa'; }
    if (countrycode == 'SM') { return 'San Marino'; }
    if (countrycode == 'ST') { return 'Sao Tome and Principe'; }
    if (countrycode == 'SA') { return 'Saudi Arabia'; }
    if (countrycode == 'SN') { return 'Senegal'; }
    if (countrycode == 'RS') { return 'Serbia'; }
    if (countrycode == 'SC') { return 'Seychelles'; }
    if (countrycode == 'SL') { return 'Sierra Leone'; }
    if (countrycode == 'SG') { return 'Singapore'; }
    if (countrycode == 'SX') { return 'Sint Maarten (Dutch part)'; }
    if (countrycode == 'SK') { return 'Slovakia'; }
    if (countrycode == 'SI') { return 'Slovenia'; }
    if (countrycode == 'SB') { return 'Solomon Islands'; }
    if (countrycode == 'SO') { return 'Somalia'; }
    if (countrycode == 'ZA') { return 'South Africa'; }
    if (countrycode == 'GS') { return 'South Georgia and the South Sandwich Islands'; }
    if (countrycode == 'SS') { return 'South Sudan'; }
    if (countrycode == 'ES') { return 'Spain'; }
    if (countrycode == 'LK') { return 'Sri Lanka'; }
    if (countrycode == 'SD') { return 'Sudan'; }
    if (countrycode == 'SR') { return 'Suriname'; }
    if (countrycode == 'SJ') { return 'Svalbard and Jan Mayen'; }
    if (countrycode == 'SZ') { return 'Swaziland'; }
    if (countrycode == 'SE') { return 'Sweden'; }
    if (countrycode == 'CH') { return 'Switzerland'; }
    if (countrycode == 'SY') { return 'Syrian Arab Republic'; }
    if (countrycode == 'TW') { return 'Taiwan'; }
    if (countrycode == 'TJ') { return 'Tajikistan'; }
    if (countrycode == 'TZ') { return 'Tanzania'; }
    if (countrycode == 'TH') { return 'Thailand'; }
    if (countrycode == 'TL') { return 'Timor-Leste'; }
    if (countrycode == 'TG') { return 'Togo'; }
    if (countrycode == 'TK') { return 'Tokelau'; }
    if (countrycode == 'TO') { return 'Tonga'; }
    if (countrycode == 'TT') { return 'Trinidad and Tobago'; }
    if (countrycode == 'TN') { return 'Tunisia'; }
    if (countrycode == 'TR') { return 'Turkey'; }
    if (countrycode == 'TM') { return 'Turkmenistan'; }
    if (countrycode == 'TC') { return 'Turks and Caicos Islands'; }
    if (countrycode == 'TV') { return 'Tuvalu'; }
    if (countrycode == 'UG') { return 'Uganda'; }
    if (countrycode == 'UA') { return 'Ukraine'; }
    if (countrycode == 'AE') { return 'United Arab Emirates'; }
    if (countrycode == 'GB') { return 'United Kingdom'; }
    if (countrycode == 'UK') { return 'United Kingdom'; }
    if (countrycode == 'US') { return 'United States of America'; }
    if (countrycode == 'UM') { return 'United States Minor Outlying Islands'; }
    if (countrycode == 'UY') { return 'Uruguay'; }
    if (countrycode == 'UZ') { return 'Uzbekistan'; }
    if (countrycode == 'VU') { return 'Vanuatu'; }
    if (countrycode == 'VE') { return 'Venezuela'; }
    if (countrycode == 'VN') { return 'Viet Nam'; }
    if (countrycode == 'VG') { return 'Virgin Islands (British)'; }
    if (countrycode == 'VI') { return 'Virgin Islands (U.S.)'; }
    if (countrycode == 'WF') { return 'Wallis and Futuna'; }
    if (countrycode == 'EH') { return 'Western Sahara'; }
    if (countrycode == 'YE') { return 'Yemen'; }
    if (countrycode == 'ZM') { return 'Zambia'; }
    if (countrycode == 'ZW') { return 'Zimbabwe'; }
    return 'Unknown';
  }
});



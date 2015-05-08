// shared/js/cx_extension.js

var CxExtension = Backbone.Model.extend({
  initialize: function(browser) {
    this.browser = browser;

    this.resetValues();
    this.requestOwnGeoData();
    this.requestLogEntries();
    this.requestCitizenship();
  },

  requestCitizenship: function() {
    message.send({ countryLog: true });
  },

  requestLogEntries: function() {
    message.send({ allLogEntries: true });
  },

  requestOwnGeoData: function() {
    message.send({ ownGeoData: true });
  },

  receiveCitizenship: function(countryLog) {
    var countryCodes = _.pick(countryLog.visits, _.identity);
    var citizenship = this.calculatePercentages(countryCodes);
    this.set({ citizenship: citizenship });
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

  receiveOwnGeoData: function(ownGeoData) {
    this.set({ ownGeoData: ownGeoData });
  },

  getLogEntryForUrl: function(url) {
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

  calculateDomainPercentages: function(data) {
    var counts = _.pluck(data, 'count');
    var sum = _.reduce(counts, function(memo, num) { return memo + num; }, 0);
    var result = [];
    _.each(data, function(item) {
      var percentage = (item.count / sum) * 100;
      percentage = percentage.toFixed(2);
      result.push({ code: item.countryCode, percentage: percentage, domain: item.domain });
    });
    result = _.sortBy(result, 'percentage');

    return result.reverse();
  },

  getPropertyFromEntries: function(entries, property) {
    var validEntries = _.reject(entries, function(entry) {
      return entry[property] === undefined || entry[property] === '';
    });
    var data = _.countBy(validEntries, function(entry) {
      return entry[property];
    });
    return data;
  },

  getDomainPropertiesFromEntries: function(entries) {
    var properties = ['domain', 'countryCode'];
    var validEntriesArr = [];
    _.each(properties, function(property) {
      validEntriesArr.push(_.reject(entries, function(entry) {
        return entry[property] === undefined || entry[property] === '';
      }));
    });
    var validEntries = _.intersection(validEntriesArr[0], validEntriesArr[1]);
    var data = _.groupBy(validEntries, function(entry) {
      return entry[properties[0]];
    });
    var structuredData = [];
    _.each(data, function(entries) {
      var obj = {};
      obj.domain = entries[0].domain;
      obj.countryCode = entries[0].countryCode;
      obj.count = entries.length;
      structuredData.push(obj);
    });
    return structuredData;
  },


  resetValues: function() {
    this.unset('logEntries');
    this.set({ citizenship: [] });
    this.set({ ownGeoData: '' });
  },

  eraseData: function() {
    this.resetValues();
    storage.clear();
  },

  convertIsoCode: function(countrycode) {
	if (countrycode == 'AF') { return 'AFG'; }
	if (countrycode == 'AX') { return 'ALA'; }
	if (countrycode == 'AL') { return 'ALB'; }
	if (countrycode == 'DZ') { return 'DZA'; }
	if (countrycode == 'AS') { return 'ASM'; }
	if (countrycode == 'AD') { return 'AND'; }
	if (countrycode == 'AO') { return 'AGO'; }
	if (countrycode == 'AI') { return 'AIA'; }
	if (countrycode == 'AG') { return 'ATG'; }
	if (countrycode == 'AR') { return 'ARG'; }
	if (countrycode == 'AM') { return 'ARM'; }
	if (countrycode == 'AW') { return 'ABW'; }
	if (countrycode == 'AU') { return 'AUS'; }
	if (countrycode == 'AT') { return 'AUT'; }
	if (countrycode == 'AZ') { return 'AZE'; }
	if (countrycode == 'BS') { return 'BHS'; }
	if (countrycode == 'BH') { return 'BHR'; }
	if (countrycode == 'BD') { return 'BGD'; }
	if (countrycode == 'BB') { return 'BRB'; }
	if (countrycode == 'BY') { return 'BLR'; }
	if (countrycode == 'BE') { return 'BEL'; }
	if (countrycode == 'BZ') { return 'BLZ'; }
	if (countrycode == 'BJ') { return 'BEN'; }
	if (countrycode == 'BM') { return 'BMU'; }
	if (countrycode == 'BT') { return 'BTN'; }
	if (countrycode == 'BO') { return 'BOL'; }
	if (countrycode == 'BQ') { return 'BES'; }
	if (countrycode == 'BA') { return 'BIH'; }
	if (countrycode == 'BW') { return 'BWA'; }
	if (countrycode == 'BR') { return 'BRA'; }
	if (countrycode == 'IO') { return 'IOT'; }
	if (countrycode == 'VG') { return 'VGB'; }
	if (countrycode == 'BN') { return 'BRN'; }
	if (countrycode == 'BG') { return 'BGR'; }
	if (countrycode == 'BF') { return 'BFA'; }
	if (countrycode == 'BI') { return 'BDI'; }
	if (countrycode == 'KH') { return 'KHM'; }
	if (countrycode == 'CM') { return 'CMR'; }
	if (countrycode == 'CA') { return 'CAN'; }
	if (countrycode == 'CV') { return 'CPV'; }
	if (countrycode == 'KY') { return 'CYM'; }
	if (countrycode == 'CF') { return 'CAF'; }
	if (countrycode == 'TD') { return 'TCD'; }
	if (countrycode == 'CL') { return 'CHL'; }
	if (countrycode == 'CN') { return 'CHN'; }
	if (countrycode == 'CX') { return 'CXR'; }
	if (countrycode == 'CC') { return 'CCK'; }
	if (countrycode == 'CO') { return 'COL'; }
	if (countrycode == 'KM') { return 'COM'; }
	if (countrycode == 'CG') { return 'COG'; }
	if (countrycode == 'CD') { return 'ZAR'; }
	if (countrycode == 'CK') { return 'COK'; }
	if (countrycode == 'CR') { return 'CRI'; }
	if (countrycode == 'HR') { return 'HRV'; }
	if (countrycode == 'CU') { return 'CUB'; }
	if (countrycode == 'CW') { return 'CUW'; }
	if (countrycode == 'CY') { return 'CYP'; }
	if (countrycode == 'CZ') { return 'CZE'; }
	if (countrycode == 'DK') { return 'DNK'; }
	if (countrycode == 'DJ') { return 'DJI'; }
	if (countrycode == 'DM') { return 'DMA'; }
	if (countrycode == 'DO') { return 'DOM'; }
	if (countrycode == 'TL') { return 'TLS'; }
	if (countrycode == 'EC') { return 'ECU'; }
	if (countrycode == 'EG') { return 'EGY'; }
	if (countrycode == 'SV') { return 'SLV'; }
	if (countrycode == 'GQ') { return 'GNQ'; }
	if (countrycode == 'ER') { return 'ERI'; }
	if (countrycode == 'EE') { return 'EST'; }
	if (countrycode == 'ET') { return 'ETH'; }
	if (countrycode == 'FO') { return 'FRO'; }
	if (countrycode == 'FK') { return 'FLK'; }
	if (countrycode == 'FJ') { return 'FJI'; }
	if (countrycode == 'FI') { return 'FIN'; }
	if (countrycode == 'FR') { return 'FRA'; }
	if (countrycode == 'GF') { return 'GUF'; }
	if (countrycode == 'PF') { return 'PYF'; }
	if (countrycode == 'TF') { return 'ATF'; }
	if (countrycode == 'GA') { return 'GAB'; }
	if (countrycode == 'GM') { return 'GMB'; }
	if (countrycode == 'GE') { return 'GEO'; }
	if (countrycode == 'DE') { return 'DEU'; }
	if (countrycode == 'GH') { return 'GHA'; }
	if (countrycode == 'GI') { return 'GIB'; }
	if (countrycode == 'GR') { return 'GRC'; }
	if (countrycode == 'GL') { return 'GRL'; }
	if (countrycode == 'GD') { return 'GRD'; }
	if (countrycode == 'GP') { return 'GLP'; }
	if (countrycode == 'GU') { return 'GUM'; }
	if (countrycode == 'GT') { return 'GTM'; }
	if (countrycode == 'GG') { return 'GGY'; }
	if (countrycode == 'GN') { return 'GIN'; }
	if (countrycode == 'GW') { return 'GNB'; }
	if (countrycode == 'GY') { return 'GUY'; }
	if (countrycode == 'HT') { return 'HTI'; }
	if (countrycode == 'VA') { return 'VAT'; }
	if (countrycode == 'HN') { return 'HND'; }
	if (countrycode == 'HK') { return 'HKG'; }
	if (countrycode == 'HU') { return 'HUN'; }
	if (countrycode == 'IS') { return 'ISL'; }
	if (countrycode == 'IN') { return 'IND'; }
	if (countrycode == 'ID') { return 'IDN'; }
	if (countrycode == 'IR') { return 'IRN'; }
	if (countrycode == 'IQ') { return 'IRQ'; }
	if (countrycode == 'IE') { return 'IRL'; }
	if (countrycode == 'IM') { return 'IMN'; }
	if (countrycode == 'IL') { return 'ISR'; }
	if (countrycode == 'IT') { return 'ITA'; }
	if (countrycode == 'CI') { return 'CIV'; }
	if (countrycode == 'JM') { return 'JAM'; }
	if (countrycode == 'JP') { return 'JPN'; }
	if (countrycode == 'JE') { return 'JEY'; }
	if (countrycode == 'JO') { return 'JOR'; }
	if (countrycode == 'KZ') { return 'KAZ'; }
	if (countrycode == 'KE') { return 'KEN'; }
	if (countrycode == 'KI') { return 'KIR'; }
	if (countrycode == 'KO') { return 'KOS'; }
	if (countrycode == 'KW') { return 'KWT'; }
	if (countrycode == 'KG') { return 'KGZ'; }
	if (countrycode == 'LA') { return 'LAO'; }
	if (countrycode == 'LV') { return 'LVA'; }
	if (countrycode == 'LB') { return 'LBN'; }
	if (countrycode == 'LS') { return 'LSO'; }
	if (countrycode == 'LR') { return 'LBR'; }
	if (countrycode == 'LY') { return 'LBY'; }
	if (countrycode == 'LI') { return 'LIE'; }
	if (countrycode == 'LT') { return 'LTU'; }
	if (countrycode == 'LU') { return 'LUX'; }
	if (countrycode == 'MO') { return 'MAC'; }
	if (countrycode == 'MK') { return 'MKD'; }
	if (countrycode == 'MG') { return 'MDG'; }
	if (countrycode == 'MW') { return 'MWI'; }
	if (countrycode == 'MY') { return 'MYS'; }
	if (countrycode == 'MV') { return 'MDV'; }
	if (countrycode == 'ML') { return 'MLI'; }
	if (countrycode == 'MT') { return 'MLT'; }
	if (countrycode == 'MH') { return 'MHL'; }
	if (countrycode == 'MQ') { return 'MTQ'; }
	if (countrycode == 'MR') { return 'MRT'; }
	if (countrycode == 'MU') { return 'MUS'; }
	if (countrycode == 'YT') { return 'MYT'; }
	if (countrycode == 'MX') { return 'MEX'; }
	if (countrycode == 'FS') { return 'FSM'; }
	if (countrycode == 'MD') { return 'MDA'; }
	if (countrycode == 'MC') { return 'MCO'; }
	if (countrycode == 'MN') { return 'MNG'; }
	if (countrycode == 'ME') { return 'MNE'; }
	if (countrycode == 'MS') { return 'MSR'; }
	if (countrycode == 'MA') { return 'MAR'; }
	if (countrycode == 'MZ') { return 'MOZ'; }
	if (countrycode == 'MM') { return 'MMR'; }
	if (countrycode == 'NA') { return 'NAM'; }
	if (countrycode == 'NR') { return 'NRU'; }
	if (countrycode == 'NP') { return 'NPL'; }
	if (countrycode == 'AN') { return 'ANT'; }
	if (countrycode == 'NL') { return 'NLD'; }
	if (countrycode == 'NC') { return 'NCL'; }
	if (countrycode == 'NZ') { return 'NZL'; }
	if (countrycode == 'NI') { return 'NIC'; }
	if (countrycode == 'NE') { return 'NER'; }
	if (countrycode == 'NG') { return 'NGA'; }
	if (countrycode == 'NU') { return 'NIU'; }
	if (countrycode == 'NF') { return 'NFK'; }
	if (countrycode == 'KP') { return 'PRK'; }
	if (countrycode == 'MP') { return 'MNP'; }
	if (countrycode == 'NO') { return 'NOR'; }
	if (countrycode == 'OM') { return 'OMN'; }
	if (countrycode == 'PK') { return 'PAK'; }
	if (countrycode == 'PW') { return 'PLW'; }
	if (countrycode == 'PS') { return 'PSE'; }
	if (countrycode == 'PA') { return 'PAN'; }
	if (countrycode == 'PG') { return 'PNG'; }
	if (countrycode == 'PY') { return 'PRY'; }
	if (countrycode == 'PE') { return 'PER'; }
	if (countrycode == 'PH') { return 'PHL'; }
	if (countrycode == 'PN') { return 'PCN'; }
	if (countrycode == 'PL') { return 'POL'; }
	if (countrycode == 'PT') { return 'PRT'; }
	if (countrycode == 'PR') { return 'PRI'; }
	if (countrycode == 'QA') { return 'QAT'; }
	if (countrycode == 'RO') { return 'ROU'; }
	if (countrycode == 'RU') { return 'RUS'; }
	if (countrycode == 'RW') { return 'RWA'; }
	if (countrycode == 'RE') { return 'REU'; }
	if (countrycode == 'BQ') { return 'BES'; }
	if (countrycode == 'BL') { return 'BLM'; }
	if (countrycode == 'KN') { return 'KNA'; }
	if (countrycode == 'SH') { return 'SHN'; }
	if (countrycode == 'LC') { return 'LCA'; }
	if (countrycode == 'MF') { return 'MAF'; }
	if (countrycode == 'PM') { return 'SPM'; }
	if (countrycode == 'VC') { return 'VCT'; }
	if (countrycode == 'WS') { return 'WSM'; }
	if (countrycode == 'SM') { return 'SMR'; }
	if (countrycode == 'ST') { return 'STP'; }
	if (countrycode == 'SA') { return 'SAU'; }
	if (countrycode == 'SN') { return 'SEN'; }
	if (countrycode == 'RS') { return 'SRB'; }
	if (countrycode == 'SC') { return 'SYC'; }
	if (countrycode == 'SL') { return 'SLE'; }
	if (countrycode == 'SG') { return 'SGP'; }
	if (countrycode == 'BQ') { return 'BES'; }
	if (countrycode == 'SX') { return 'SXM'; }
	if (countrycode == 'SK') { return 'SVK'; }
	if (countrycode == 'SI') { return 'SVN'; }
	if (countrycode == 'SB') { return 'SLB'; }
	if (countrycode == 'SO') { return 'SOM'; }
	if (countrycode == 'SO') { return 'SOM'; }
	if (countrycode == 'ZA') { return 'ZAF'; }
	if (countrycode == 'GS') { return 'SGS'; }
	if (countrycode == 'KR') { return 'KOR'; }
	if (countrycode == 'SS') { return 'SSD'; }
	if (countrycode == 'ES') { return 'ESP'; }
	if (countrycode == 'LK') { return 'LKA'; }
	if (countrycode == 'SD') { return 'SDN'; }
	if (countrycode == 'SR') { return 'SUR'; }
	if (countrycode == 'SZ') { return 'SWZ'; }
	if (countrycode == 'SE') { return 'SWE'; }
	if (countrycode == 'CH') { return 'CHE'; }
	if (countrycode == 'SY') { return 'SYR'; }
	if (countrycode == 'TW') { return 'TWN'; }
	if (countrycode == 'TJ') { return 'TJK'; }
	if (countrycode == 'TZ') { return 'TZA'; }
	if (countrycode == 'TH') { return 'THA'; }
	if (countrycode == 'TG') { return 'TGO'; }
	if (countrycode == 'TK') { return 'TKL'; }
	if (countrycode == 'TO') { return 'TON'; }
	if (countrycode == 'TT') { return 'TTO'; }
	if (countrycode == 'TN') { return 'TUN'; }
	if (countrycode == 'TR') { return 'TUR'; }
	if (countrycode == 'TM') { return 'TKM'; }
	if (countrycode == 'TC') { return 'TCA'; }
	if (countrycode == 'TV') { return 'TUV'; }
	if (countrycode == 'UG') { return 'UGA'; }
	if (countrycode == 'UA') { return 'UKR'; }
	if (countrycode == 'AE') { return 'ARE'; }
	if (countrycode == 'GB') { return 'GBR'; }
	if (countrycode == 'US') { return 'USA'; }
	if (countrycode == 'VI') { return 'VIR'; }
	if (countrycode == 'UY') { return 'URY'; }
	if (countrycode == 'UZ') { return 'UZB'; }
	if (countrycode == 'VU') { return 'VUT'; }
	if (countrycode == 'VE') { return 'VEN'; }
	if (countrycode == 'VN') { return 'VNM'; }
	if (countrycode == 'WF') { return 'WLF'; }
	if (countrycode == 'EH') { return 'ESH'; }
	if (countrycode == 'YE') { return 'YEM'; }
	if (countrycode == 'ZM') { return 'ZMB'; }
	if (countrycode == 'ZW') { return 'ZWE'; }
    return null;
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
    if (countrycode == 'US') { return 'USA'; }
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

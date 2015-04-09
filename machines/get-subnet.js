module.exports = {


    friendlyName: 'Get Subnet',


    description: 'Get subnet by extensible attribute.',


    extendedDescription: 'Returns an object',


    inputs: {
        host: {
            example: 'infoblox-host.customer.com',
            description: 'The host address of the Infoblox appliance',
            required: true
        },
        username: {
            example: 'api-user',
            description: 'The username',
            required: true
        },
        password: {
            example: 'SomePassword',
            description: 'The password',
            required: true
        },
        api: {
            example: '1.6',
            description: 'The API version. eg. "1.6"',
            required: true
        },
        exattr: {
            example: 'Building',
            description: 'The extensible attribute to search by. (Case sensitive)',
            required: true
        },
        call: {
            example: 'foo',
            description: 'The search string',
            required: true
        },
        strictSearch: {
            example: true,
            description: 'Perform exact call. Defaults to false.',
            required: false
        },
        optional: {
            example: 'VLAN:=60',
            description: 'Optional params.',
            required: false
        }

    },


    defaultExit: 'success',


    exits: {

        error: {
            description: 'Unexpected error occurred.',
        },

        wrongOrNoUserPassword: {
            description: 'Invalid or unprovided Username/Password. All calls must have Username/Password.'
        },

        success: {
            description: 'Returns an object.',
            example: [{
                "_ref": "network/ZG5zLm5ldHdvcmskMTAuMjE2LjIuMC8yMy8w:10.216.2.0/23/Default",
                "extattrs": {
                    "LocationID": {
                        "value": "968096"
                    },
                    "NetworkName": {
                        "inheritance_source": {
                            "_ref": "networkcontainer/ZG5zLm5ldHdvcmtfY29udGFpbmVyJDEwLjIxNi4wLjAvMTUvMA:10.216.0.0/15/Default"
                        },
                        "value": "Clients"
                    },
                    "Building": {
                        "value": "Fifth"
                    },
                    "Location": {
                        "value": "South"
                    },
                    "VLAN": {
                        "inheritance_source": {
                            "_ref": "networkcontainer/ZG5zLm5ldHdvcmtfY29udGFpbmVyJDEwLjIxNi4wLjAvMTUvMA:10.216.0.0/15/Default"
                        },
                        "value": "60"
                    }
                },
                "network": "10.216.2.0/23",
                "network_view": "Default"
            }]
        },

    },


    fn: function(inputs, exits) {

        var URL = require('url');
        var QS = require('querystring');
        var _ = require('underscore');
        var Http = require('machinepack-http');
        var operator;

        if (inputs.strictSearch) {
            operator = '=';
        } else {
            operator = '~=';
        }
        if (inputs.optional) {
            inputs.optional = '&*' + inputs.optional;
        } else {
            inputs.optional = '';
        }
        console.log(inputs.optional);
        var formattedurl = 'https://' + inputs.host + '/wapi/v' + inputs.api + '/network?*' + inputs.exattr + ':' + operator + inputs.call + inputs.optional + '&_return_fields%2B=extattrs';

        formattedurl = formattedurl.replace('\u0020', "%20");
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";



        Http.sendHttpRequest({
            baseUrl: formattedurl,
            url: '',
            method: 'get',
            headers: {
                "Authorization": "Basic " + new Buffer(inputs.username + ":" + inputs.password).toString("base64"),
            }
        }).exec({
            success: function(result) {
                var obj = {};

                try {
                    var data = JSON.parse(result.body);

                    for (var i = 0; i < data.length; i++) {
                        obj.reference = data[i]._ref;
                        obj.network = data[i].network;
                        obj.extattrs = data[i].extattrs
                    };

                } catch (e) {
                    return exits.error('An error occurred while parsing the reponse from Infoblox.');
                }

                return exits.success(data);
                //Returns an object.

            },
            notOk: function(result) {

                try {
                    if (result.status === 403) {
                        return exits.wrongOrNoKey("Invalid or unprovided Username/Password. All calls must have Username/Password.");
                    }
                } catch (e) {
                    return exits.error(e);
                }

            },
            // An unexpected error occurred.
            error: function(err) {

                exits.error(err);
            },
        });
    },
};
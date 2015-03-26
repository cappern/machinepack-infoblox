module.exports = {


    friendlyName: 'Get network ref',


    description: 'Get the \'ref-ID\' for a given subnet',


    extendedDescription: '',


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
        subnet: {
            example: '10.10.10.0/24',
            description: 'The subnet wich the next available IP will be picked from. (CIDR notation)',
            required: true
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
            description: 'Done.',
        },

    },


    fn: function(inputs, exits) {

        var URL = require('url');
        var QS = require('querystring');
        var _ = require('underscore');
        var Http = require('machinepack-http');

        var getNetworkRef = 'https://' + inputs.host + '/wapi/v' + inputs.api + '/network?network=' + inputs.subnet;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


        Http.sendHttpRequest({
            baseUrl: getNetworkRef,
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
                        var ref = data[i]._ref;
                    };
                    obj.reference = /network\/(.*?):/.exec(ref)[1];

                } catch (e) {
                    return exits.error('An error occurred while parsing the reponse from Infoblox.');
                }
                return exits.success(obj);
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
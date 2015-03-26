module.exports = {


    friendlyName: 'Get next available IP',


    description: 'Get the next available IP-address(es) from a subnet',


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
        ref: {
            example: 'ZG5zLm5ldHdRcmskMTAuMjEwLjAuMC8yNC8w',
            description: 'The ref of the subnet wich the next available IP will be picked from',
            required: true
        },
        num: {
            example: 3,
            description: 'How many IPs do you need?',
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
            example: {
                ips: ['10.210.0.3',
                    '10.210.0.4',
                    '10.210.0.5',
                    '10.210.0.6',
                    '10.210.0.7'
                ]
            },

        },

    },


    fn: function(inputs, exits) {

        var URL = require('url');
        var QS = require('querystring');
        var _ = require('underscore');
        var Http = require('machinepack-http');
        var getNextNetwork = 'https://' + inputs.host + '/wapi/v' + inputs.api + '/network/' + inputs.ref + '?_function=next_available_ip';

        console.log('url: ' + getNextNetwork);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


        Http.sendHttpRequest({
            baseUrl: getNextNetwork,
            url: '',
            method: 'post',
            headers: {
                "Authorization": "Basic " + new Buffer(inputs.username + ":" + inputs.password).toString("base64"),
                "Content-Type": "application/json"
            },
            params: {
                "num": inputs.num
            }
        }).exec({
            success: function(result) {
                var obj = {};

                try {
                    var data = JSON.parse(result.body);
                    obj.ips = data.ips;


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
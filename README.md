# sexual-health-information-etl
> ETL to retrieve sexual health information and support services from syndication and store as JSON

[![GitHub Release](https://img.shields.io/github/release/nhsuk/sexual-health-information-etl.svg)](https://github.com/nhsuk/sexual-health-information-etl/releases/latest/)
[![Greenkeeper badge](https://badges.greenkeeper.io/nhsuk/sexual-health-information-etl.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nhsuk/sexual-health-information-etl.svg?branch=master)](https://travis-ci.org/nhsuk/sexual-health-information-etl)
[![Coverage Status](https://coveralls.io/repos/github/nhsuk/sexual-health-information-etl/badge.svg?branch=master)](https://coveralls.io/github/nhsuk/sexual-health-information-etl?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/nhsuk/sexual-health-information-etl/badge.svg)](https://snyk.io/test/github/nhsuk/sexual-health-information-etl)

## Installation

Clone the repo: `git clone https://github.com/nhsuk/sexual-health-information-etl.git`
and review the [`scripts`](scripts) to get up and running.

## Testing

The application uses [Docker](https://www.docker.com/) to run in containers.
Development is typically done on the host machine. Files are loaded into the
container and changes are automatically updated.

Use the `test` script for continuous testing during development.
# Run process

In order for the process to access the syndication feed an API key is required.
Details of registration are available on
[NHS Choices](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx).
The application needs the API key available within the environment as the variable `SYNDICATION_API_KEY`.

The output is uploaded to Azure Blob Storage, a suitable connection string should be set in the `AZURE_STORAGE_CONNECTION_STRING` variable.
For further details see [Azure Blob Storage](https://azure.microsoft.com/en-gb/services/storage/blobs/).

The ETL retrieves all the Sexual Health and Information Services from Syndication API via the last modified date. Serco reload all data when a change is made, so the `modifiedsince` end point will contain all records.
The date of the most recently modified file in blob storage beginning `shis-data` is used as the last run date. 
If no file is present the last known good run date of `20/02/18` will be used.
The ETL will exit if the `modifiedsince` end point contains no records, or returns a `404` error.

The ETL version is included along with a timestamp to enable a full rescan if the data structure changes, as this will be reflected in the application version.

Once the initial scan is complete, failed records will be revisited. IDs for records still failing after the second attempt are listed in a `summary.json` file.

Running `scripts/start` will bring up a docker containerand initiate the scrape.

A successful scrape will result in the file `shis-data.json` being written to the `output` folder and to the Azure storage location specified in the environmental variables.

The files uploaded to Azure Blob Storage are:

`summary-YYYYMMDD-VERSION.json`

`shis-data-YYYYMMDD-VERSION.json`

`shis-data.json`

 where `YYYYMMDD` is the current year, month and date, and `VERSION` is the current major version of the ETL as defined in the `package.json`.

The ETL may also be run locally with `yarn start`.

The output JSON will be an array of objects in the format shown in the [Sample SHIS Data](sample-shis-data.json)

Most of the fields are self explanatory, the three that require further explanation are `id`, `location`, and `venueType`.

`id` is only used internally. This is the ID retrieved from Serco with the filename prefixed to avoid collisions, i.e. `shis-data-19595086`.

Location is in [GeoJSON](http://geojson.org/) format.

`venueType` can be either `Pharmacy`, `Clinic`, `Community`, `Other`, `ClinicCommunity` or `ClinicPharmacy`

## Test environments

As the application is being developed, every Pull Request has its own test
environment automatically built and deployed to.

Every environment apart from the one we want the public to access requires
basic authentication to access. The username and password are not secret, in
fact they are included within environment variable table below.
The intention with the authentication challenge is to prevent people whom may
stumble across the site and not realise it is for testing, it also prevents
access by search engines and other bots.

## Environment variables

Environment variables are expected to be managed by the environment in which
the application is being run. This is best practice as described by
[twelve-factor](https://12factor.net/config).

In order to protect the application from starting up without the required
env vars in place
[require-environment-variables](https://www.npmjs.com/package/require-environment-variables)
is used to check for the env vars that are required for the application to run
successfully.
This happens during the application start-up. If an env var is not found the
application will fail to start and an appropriate message will be displayed.

Environment variables are used to set application level settings for each
environment.


| Variable                           | Description                                                                                                 | Default                | Required |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------- | ---------------------- | :------- |
| `AZURE_STORAGE_CONNECTION_STRING`  | Azure storage connection string                                                                             |                        | yes      |
| `CONTAINER_NAME`                   | Azure storage container name                                                                                | etl-output             |          |
| `LOG_LEVEL`                        | [log level](https://github.com/trentm/node-bunyan#levels)                                                   | Depends on `NODE_ENV`  |          |
| `NODE_ENV`                         | node environment                                                                                            | development            |          |
| `SYNDICATION_API_KEY`              | API key to access syndication                                                                               |                        | yes      |
| `API_URL`                          | URL to Syndicate service to scrape                                                                          | http://v1.syndication.nhschoices.nhs.uk/services/types/sexualhealthinformationandsupport | no      |
| `OUTPUT_FILE`                      | Filename saved to azure                                                                                     | shis-data              | no      |

## FAQ

* Is the application failing to start?
  * Ensure all expected environment variables are available within the environment
  * If set, `LOG_LEVEL` must be a number and one of the defined [log levels](https://github.com/trentm/node-bunyan#levels)
  * Check for messages in the logs

## Architecture Decision Records

This repo uses
[Architecture Decision Records](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
to record architectural decisions for this project.
They are stored in [doc/adr](doc/adr).

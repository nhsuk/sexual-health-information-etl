# Sexual Health Information ETL
> ETL to retrieve 'Sexual Health Information and Support Services', and 'Chlamydia Screening for Under 25s' data from syndication and store as JSON

[![GitHub Release](https://img.shields.io/github/release/nhsuk/sexual-health-information-etl.svg)](https://github.com/nhsuk/sexual-health-information-etl/releases/latest/)
[![Greenkeeper badge](https://badges.greenkeeper.io/nhsuk/sexual-health-information-etl.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nhsuk/sexual-health-information-etl.svg?branch=master)](https://travis-ci.org/nhsuk/sexual-health-information-etl)
[![Coverage Status](https://coveralls.io/repos/github/nhsuk/sexual-health-information-etl/badge.svg?branch=master)](https://coveralls.io/github/nhsuk/sexual-health-information-etl?branch=master)

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

The ETL calls the `modifiedsince` end point to determine if the ETL needs to be run.
If the endpoint returns a 404 error, i.e page not found, there is no updated data and the ETL will not run.

If a `200` code is returned the data is considered to have changed, and all data will be reloaded via the `all` end point.
All the data is reloaded when a change is made to the Sexual Health Services data, and the ID for a record may change when reloaded.
An incremental update approach is not possible due to IDs not being consistent.

The date of the most recently modified file in blob storage beginning `shis-data`[<sup>*</sup>](#development-notes) is used as the last run date.

If no file is present the last known good run date of `20/02/2018` will be used.
This date may be changed by the setting enviroment variable `INITIAL_LAST_RUN_DATE`.

The ETL version from the [package.json](package.json) is included along with a datestamp to enable a full rescan if the data
structure changes, as this will be reflected in the application version.

Once the initial scan is complete, failed records will be revisited. IDs for records still failing after the second attempt
are listed in a `shis-data-summary.json`[<sup>*</sup>](#development-notes) file.

Running `scripts/start` will bring up a docker container and initiate the scrape at a scheduled time, GMT. The default is
11pm. The time of the scrape can be overridden by setting the environment variable `ETL_SCHEDULE`.
e.g. `export ETL_SCHEDULE='25 15 * * *'` will start the processing at 3:25pm. 
Note: the container time is GMT and does not take account of daylight saving, you may need to subtract an hour from the time if
it is currently BST.

During local development it is useful to run the scrape at any time. This is possible by running `node app.js` (with the appropriate env vars set).

Further details on node-schedule available
[here](https://www.npmjs.com/package/node-schedule)

A successful scrape will result in the file `shis-data.json`[<sup>*</sup>](#development-notes) being written to the `output` folder and to the Azure Blob Storage
location specified in the environmental variables.

The files uploaded to Azure Blob Storage are:

`shis-data-summary-YYYYMMDD-VERSION.json`[<sup>*</sup>](#development-notes)

`shis-data-YYYYMMDD-VERSION.json`[<sup>*</sup>](#development-notes)

`shis-data.json`[<sup>*</sup>](#development-notes)

where `YYYYMMDD` is the current year, month and date, and `VERSION` is the current major version of the ETL as defined in the `package.json`.

### Development Notes
The ETL may be configured to collect data from the 'Sexual Health Information and Support Services', or the 'Chlamydia Screening for Under 25s'
end point in Syndication. The details above describe the operation when configured to retrieve 'Sexual Health Information and Support Services' data.

The provided [docker-compose.yml](docker-compose.yml) runs two containers, one for each possible ETL as described
[below](#docker-compose-structure-for-deployment-and-development). The output files have been set to `dev-shis-data`
and `dev-csu25-data` respectively.

This ensures that during development the output files will all include a `dev-` prefix so as not overwrite the production `shis-data`
and `csu25-data` files in Azure.

## Structure of JSON Data

The output JSON will be an array of objects in the format shown in the [Sample SHIS Data](sample-shis-data.json) file.
Most of the fields are self-explanatory, the three that require further explanation are `id`, `location`, and `venueType`.

`id` is only used internally. This is an ID retrieved from Syndication and may change when data is updated.

`gsdId` is the Generic Service Directory ID at time of running. This is the ID used in the NHS Services Directory, i.e. `9413748`
would be accessed at the URL http://www.nhs.uk/ServiceDirectories/Pages/GenericServiceDetails.aspx?id=9413748.

`Location` is in [GeoJSON](http://geojson.org/) format.

`venueType` can be either `Pharmacy`, `Clinic`, `Community`, `Other`, `ClinicCommunity` or `ClinicPharmacy`

## Test environments

As the application is being developed, every Pull Request has its own test
environment automatically built and deployed to.

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


| Variable                           | Description                                                                                                 | Default                                           | Required |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | :------- |
| `INITIAL_LAST_RUN_DATE`            | Initial run date in `YYYY-MM-DD` format to use if no previous run detected                                  | 2018-02-20                                        |          |
| `AZURE_STORAGE_CONNECTION_STRING`  | Azure storage connection string                                                                             |                                                   | yes      |
| `CONTAINER_NAME`                   | Azure storage container name                                                                                | etl-output                                        |          |
| `DISABLE_SCHEDULER`                | set to 'true' to disable the scheduler                                                                      | false                 |          |
| `ETL_SCHEDULE`                     | Time of day to run the upgrade. [Syntax](https://www.npmjs.com/package/node-schedule#cron-style-scheduling) | 0 23 * * * (11:00 pm) |          |
| `LOG_LEVEL`                        | [log level](https://github.com/trentm/node-bunyan#levels)                                                   | Depends on `NODE_ENV`                             |          |
| `NODE_ENV`                         | node environment                                                                                            | development                                       |          |
| `SYNDICATION_API_KEY`              | API key to access syndication                                                                               |                                                   | yes      |
| `SYNDICATION_SERVICE_END_POINT`    | URL to Syndicate service to scrape                                                                          | http://v1.syndication.nhschoices.nhs.uk/services/types/sexualhealthinformationandsupport | no      |
| `OUTPUT_FILE`                      | Filename saved to azure                                                                                     | shis-data                                         |          |
| `ETL_NAME`                         | ETL name for logging purposes                                                                               | set to `shis-data-etl` in the docker compose file | yes      |

## Docker Compose Structure for Deployment and Development

The `docker-compose.yml` used for development and deployment via Rancher have a similar structure.
A stack is run with two `sexual-health-information-etl` images with different configurations.

The convention for environment variables used in the Rancher configuration is to add a `SHIS_` or `CSU25_` prefix to the
`ETL_SCHEDULE`, `INITIAL_LAST_RUN_DATE`, `OUTPUT_FILE`, and `SYNDICATION_SERVICE_END_POINT` environment variables.
These are then mapped to the appropriate suffix-less variable in the container, i.e. for the
'Sexual Health Information and Support Services' container `SHIS_ETL_SCHEDULE` is mapped to `ETL_SCHEDULE`, and so on.

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

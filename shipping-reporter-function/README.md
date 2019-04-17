# Soaring Logistics - Shipping Reporter Function.

This repository contains the Node application sources for an application that reads shipping-records (from the Logistics MS) and creates CSV files with one line per shipping record. The application reads data from a REST API, translates the JSON response to a CSV document and writes that document to Oracle Cloud Infrastructure Object Storage through its REST API.

This application can be run as stand alone application - `node saveObject.js` -  and also as Oracle Function on any Fn installation or on Oracle Functions cloud. The func.yaml and func.js files describe and wrap saveObject in an Fn format.

When the function has been deployed as Oracle FaaS Function, it is invoked in the way of Oracle Functions. See for example https://technology.amis.nl/2019/03/17/invoke-an-oracle-function-on-oracle-cloud-infrastructure-from-a-node-application/ and https://github.com/shaunsmith/fn-node-invokebyendpoint/blob/master/invokefunc.js )

## Initialization

To get going with these sources, you will go through some steps:
 
Clone GitHub Repository
Run npm install
Copy your Private Key File

### Copy your Private Key file into the project

At one point, you have probably used `openssl genrsa` to generate a private key (protected with a passphrase) for working against OCI APIs, which resulted in a *.pem file. Please copy this file into the project. In the next step, you have to set the relative location of this file in the configuration.js file - property privateKeyFile.

### Configure your environment parameters in confguration.js

File configuration.js contains all environment specific settings for your Cloud Tenancy, Compartment, User, Public Fingerprint and Private Key as well as the Bucket on Oracle Object Storage Cloud. Update this file with your own settings. Also configure the endpoint for Logistics MS.

### Configure your logging options

File logger.js configures the logging channels for the application. In order to get any logging output for a Function, it is necessary to use a logging service such as PaperTrail. In the near future, Oracle Functions will work with the OCI logging infrastructure.

## Deploy and Run as Fn Function

Optional: Copy all files to the location of the function's definition:

In my case, I work in a Linux VM configured for Oracle Fn, OCI usage and Oracle Functions. This VM has a host folder with all application sources mapped to /vagrant/shippings-reporter-func. The next command copies the latest source to their own directory from where the Fn deployment is done.

```
yes | cp -rf /vagrant/shippings-reporter-func/*  .
```
Deploy the function:

fn deploy --app soaring

Invoke the function:

echo -n '{period:"day", objectName:"shippings-today.csv",name:"Chronos", "payload":{"you":"lovely person"}}' | fn invoke soaring shippings-reporter-func   

## Deploy and invoke as Oracle Functions (FaaS) Function

Follow the generic instructions for deploying a Function. See for invocation in those same instructions, as well as in https://technology.amis.nl/2019/03/17/invoke-an-oracle-function-on-oracle-cloud-infrastructure-from-a-node-application/ and https://github.com/shaunsmith/fn-node-invokebyendpoint/blob/master/invokefunc.js.

# Schedule Function Execution

Currently, Oracle Functions can only be invoked through the OCI REST API. They cannot be triggered by events or scheduled as background jobs. One way to schedule the execution of this function is through the use of a Kubernetes CronJob that triggers execution of a Container. In this case, the container that is triggered is a fairly generic Oracle Function Invoker container. The container is configured with Functions Compartment, Application and Function Name. The container has Java code to invoke any function; the invocation of the Java program is tailored based on the configuration of the container through a shell script. 

The shippings-reporter-k8s-cronjob.yml defines the Kubernetes CronJob that triggers the Pod with the Container - applying the configuration that make it invoke the shippings-reporter-func function. This resource is created through:

```
kubectl apply -f shipping-reporter-function/shippings-reporter-k8s-cronjob.yml
```


# Resources
Crucial resources:

[GitHub Repo OCI-Rest-APIs-nodejs by Christopher Beck with foundation for invoking many OCI REST APIs from NodeJS - I have used crucial elements from this example](https://github.com/christopherbeck/OCI-Rest-APIs-nodejs)

[Papertrail Logging Service](https://papertrailapp.com)

[Medium Article: Logging in NodeJS using Papertrail](https://medium.com/@gauravumrani/logging-in-nodejs-using-papertrail-47ed7d888457)

[OCI Object Storage Service Documentation](https://docs.cloud.oracle.com/iaas/Content/Object/Concepts/objectstorageoverview.htm)
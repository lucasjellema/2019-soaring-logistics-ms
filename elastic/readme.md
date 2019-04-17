# Running Elastic Search on Kubernetes

To run an Elastic Search instance on Kubernetes - and make it available to consumers within the cluster (through Service) and outside (through Ingress) - use these files:

* kubectl apply -f 01-elastic-service-discovery.yml
* kubectl apply -f elastic\02-elastic-service-master.yml
* kubectl apply -f elastic\03-elastic-service-data.yml
* kubectl apply -f elastic\04-elastic-service-elasticsearch.yml


* kubectl apply -f elastic\09-elastic-stateful-master.yml
* kubectl apply -f elastic\10-elastic-stateful-data.yml

* kubectl apply -f elastic\15-elastic-ingress.yml


Note: these files expect a namespace called *soaring-clouds* already exists. If it does not, you can create it with:
```kubectl create namespace soaring-clouds```

Note: the storage class used in the volumeClaimTemplates in the 10-elastic-stateful-data.yml and 09-elastic-stateful-master.yml files is specific to the Kubernetes Provider. The storage class is oci on Oracle Cloud Infrastructure and different when you run Elastic Search on a different Kubernetes environment. You need to change that storage class (such as to *standard* for Minikube in which case you  need to run ../kubernetes/05-persistent-volume.yml before the stateful set created here will get a statisfied persistent volume claim).

See: (https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/)

In order to access Elastic from outside the K8S cluster, use this URL:
http://IP-of-cluster-load-balancer[:port assigned to service]/soaring/elastic/.


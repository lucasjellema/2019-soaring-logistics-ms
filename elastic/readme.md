# Running Elastic Search on Kubernetes

To run an Elastic Search instance on Kubernetes - and make it available to consumers within the cluster (through Service) and outside (through Ingress) - use these files:

* kubectl apply -f 20-elastic-service.yml
* kubectl apply -f 10-elastic-stateful.yml
* kubectl apply -f 30-elastic-ingress.yml

Alternatively you could run ```kubectl apply -f .``` for the entire directory.

Note: these files expect a namespace called *soaring-clouds* already exists. If it does not, you can create it with:
```kubectl create namespace soaring-clouds```

Note: the storage class used in the volumeClaimTemplates in the es-stateful.yml file is specific to Oracle Cloud Infrastructure. If you run Elastic Search on a different Kubernetes environment, you need to change that storage class (such as to *manual* for Minikube in which case you  need to run ../kubernetes/05-persistent-volume.yml before the stateful set created here will get a statisfied persistent volume claim).

See: (https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/)

In order to access Elastic from outside the K8S cluster, use this URL:
http://IP-of-cluster-load-balancer[:port assigned to service]/soaring/elastic/.


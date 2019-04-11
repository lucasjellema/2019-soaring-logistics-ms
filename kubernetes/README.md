# Generic Kubernetes Resources

## Persistent Volume on Minikube
To create a persistent volume (mapped to a folder in the minikube VM) run 

kubectl apply -f 05-persistent-volume.yml 

then you can make use of storage class *manual*  in volume claims.


## Traefik Ingress Controller
To configure the Traefik Ingress Controller:

kubectl apply -f 10-traefik.yml

Note: when running on Minikube, you can in theory use this command to change the type from LoadBalancer to NodePort:
(I could not get it to work though)
kubectl patch svc traefik-ingress-service -p='{"spec": {"type": "NodePort"}}' -–namespace kube-system

instead: use ```kubectl delete svc traefik-ingress-service --namespace kube-system``` to remove the service, then ```kubectl apply -f ../kubernetes/11-traefik-service-minikube.yml```

then:
http://IP-of-cluster-load-balancer:<port assigned to service>





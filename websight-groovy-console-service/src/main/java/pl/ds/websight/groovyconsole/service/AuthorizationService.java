package pl.ds.websight.groovyconsole.service;

import javax.jcr.Session;

public interface AuthorizationService {

    boolean isAllowed(Session session);

}

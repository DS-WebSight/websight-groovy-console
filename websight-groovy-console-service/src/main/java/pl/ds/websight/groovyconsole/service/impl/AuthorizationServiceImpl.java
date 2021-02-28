package pl.ds.websight.groovyconsole.service.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.Group;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.jcr.base.util.AccessControlUtil;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.ds.websight.groovyconsole.service.AuthorizationService;

import javax.jcr.RepositoryException;
import javax.jcr.Session;
import java.util.stream.Stream;

@Component(service = AuthorizationService.class)
@Designate(ocd = AuthorizationServiceConfig.class)
public class AuthorizationServiceImpl implements AuthorizationService {

    private static final Logger LOG = LoggerFactory.getLogger(AuthorizationServiceImpl.class);

    private AuthorizationServiceConfig config;

    @Override
    public boolean isAllowed(Session session) {
        if (session != null) {
            final String userId = session.getUserID();
            try {
                UserManager userManager = AccessControlUtil.getUserManager(session);
                return isAllowedUser(userId) || isMemberOfAllowedGroup(userManager, userId);
            } catch (RepositoryException e) {
                LOG.warn("Error while validating whether the user is member of allowed group", e);
            }
        }
        return false;
    }

    private boolean isAllowedUser(String userId) {
        return Stream.of(config.allowed_users())
                .anyMatch(allowedUser -> StringUtils.equals(userId, allowedUser));
    }

    private boolean isMemberOfAllowedGroup(UserManager userManager, String userId) throws RepositoryException {
        Authorizable user = userManager.getAuthorizable(userId);
        for (String allowedGroupName : config.allowed_groups()) {
            Authorizable allowedAuthorizable = userManager.getAuthorizable(allowedGroupName);
            if (allowedAuthorizable != null && allowedAuthorizable.isGroup()) {
                Group allowedGroup = (Group) allowedAuthorizable;
                if (allowedGroup.isMember(user)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Activate
    private void activate(AuthorizationServiceConfig config) {
        this.config = config;
    }

}

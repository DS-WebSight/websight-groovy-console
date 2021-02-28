package pl.ds.websight.groovyconsole.fragments.global.globalnavigation.administration;

import org.osgi.service.component.annotations.Component;
import pl.ds.websight.fragments.registry.WebFragment;

@Component
public class PageNavigationItemWebFragment implements WebFragment {

    @Override
    public String getKey() {
        return "websight.administration.content-navigation.main";
    }

    @Override
    public String getFragment() {
        return "/apps/websight-groovy-console/web-resources/fragments/administration/content-navigation/main/NavigationItemFragment.js";
    }

    @Override
    public int getRanking() {
        return 400;
    }
}

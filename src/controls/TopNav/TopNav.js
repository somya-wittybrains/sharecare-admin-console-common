import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';
import {
  Menu,
  Dropdown,
  Icon,
  Container,
  Popup,
  Loader,
  Modal,
  Item
} from 'semantic-ui-react';
import LoadingSegment from 'controls/LoadingSegment';
import { Link, withRouter } from 'react-router-dom';
import { sortBy } from 'lodash';
import { t } from 'translate';
import {
  useAppModelStore,
  //useVersionStore,
  useCasesTasksStore
} from 'model/hooks';
import routerPropTypes from 'model/router-prop-types';
import { ReactComponent as SharecareLogo } from '../sharecare-logo.svg';
//import HelpContent from '../TopNavHelpContent';
import TopNavToolsContent from '../TopNavToolsContent';
import TopNavAccountMenuItem from '../TopNavAccountMenuItem';
import './TopNav.less';
import useSAML from 'hooks/useSAML';
import { ReactComponent as ToolsIcon } from '../tools-icon.svg';
import { TasksModalComponent } from 'common-modules/cases-tasks-management';
import TopmostSponsorSelect from '../TopmostSponsorSelect';
import GlobalEventsListener from 'controls/GlobalEventsListener/GlobalEventsListener';
import UserNotifications from 'controls/UserNotifications/UserNotifications';
const debug = require('debug')('controls.TopNav');

const TopNav = observer(
  ({
    showUserNotifications = false,
    components,
    location: { pathname },
    history
  }) => {
    debug('render()');
    const { isSAMLEnabled } = useSAML();
    const { configStore, authStore, profileStore, sponsorStore } = useAppModelStore();
    const casesTasksStore = useCasesTasksStore();
    //const { currentVersion = '' } = useVersionStore();
    //const [version = '', buildNumber = ''] = currentVersion.split('-');

    const showTasksMenu =
      authStore.hasRole('advocacy', 'CONSOLE_ADVOCACY_USERACCESS') ||
      authStore.hasRole('advocacy', 'CONSOLE_ADVOCACY_VIEWER') ||
      authStore.hasRole('advocacy', 'CONSOLE_ADVOCACY_MANAGER');

    useEffect(() => {
      const selectedSponsorId = sponsorStore.getSponsorId(sessionStorage);
      if (
        selectedSponsorId &&
        sponsorStore.sponsor &&
        selectedSponsorId !== sponsorStore.sponsor.id
      )
        sponsorStore.setSponsor(selectedSponsorId, sessionStorage);
      if (showTasksMenu) {
        (async () => {
          await casesTasksStore.getAdvocates({ updateOpenTasksCount: true });
          await casesTasksStore.getCasesTasksFields();
        })();
      }
    }, [
      sponsorStore.advocacySponsors,
      casesTasksStore,
      sponsorStore,
      showTasksMenu
    ]);

    const showNav =
      authStore.isLoggedIn &&
      (authStore.hasPassword || configStore.ssoMethod !== 'direct');
    const activeModule = components.find(({ path }) =>
      pathname.startsWith(`/${path}`)
    );
    const sponsorId = sponsorStore.getSponsorId(sessionStorage);
    const sponsorName = sponsorStore.getSponsorName(sessionStorage);
    const checkIfComponentProcessesSponsorChange = () => {
      if (
        pathname === '/advocacy' ||
        pathname === '/cases' ||
        pathname === '/tasks' ||
        pathname.indexOf('/advocacy/groups') !== -1 ||
        pathname.indexOf('/advocacy/members') !== -1 ||
        pathname.indexOf('/audiences/products/communication') !== -1 ||
        pathname.indexOf('/audiences/products/sponsored') !== -1 ||
        pathname.indexOf('/benefits-hub/products/sponsored') !== -1 ||
        pathname.indexOf('/audiences/products/bundles') !== -1 ||
        pathname.indexOf('/members/account') !== -1 ||
        pathname.indexOf('/members/member') !== -1
      )
        return true;

      const pathTokens = pathname.split('/').filter(Boolean);
      let desiredIndex = pathTokens.indexOf('audiences');
      if (desiredIndex === -1) desiredIndex = pathTokens.indexOf('templates');
      if (desiredIndex === -1) desiredIndex = pathTokens.indexOf('challenges');
      if (desiredIndex === -1) desiredIndex = pathTokens.indexOf('rewards');
      if (desiredIndex === -1) {
        if (
          pathTokens.indexOf('campaign-management') === 0 &&
          pathTokens.length >= 2
        )
          return true;
      }
      if (desiredIndex !== -1) {
        const nextItems = pathTokens.filter(
          (path, index) => index > desiredIndex
        );
        if (nextItems.length === 2 || nextItems.length === 3) return true;
      }

      return false;
    };

    const handleTasksMenu = () => {
      (async () => {
        await casesTasksStore.getAdvocates({ updateOpenTasksCount: true });
        await casesTasksStore.getCasesTasksFields();
      })();
    };

    debug(sponsorId);

    const systemComponents = components.filter(
      ({ isSystemModule }) => isSystemModule
    );

    const standardComponents = components.filter(
      ({ isSystemModule }) => !isSystemModule
    );

    const totalSortedComponents = Object.entries(
      standardComponents.reduce(
        (categories, component) => ({
          ...categories,
          [component.category]: (categories[component.category] || []).concat(
            component
          )
        }),
        {}
      )
    ).sort((c1, c2) => c1[0].localeCompare(c2[0]));

    const [isToolsOpen, setIsToolsOpen] = useState(false);
    //const [isTasksOpen, setIsTasksOpen] = useState(false);
    const [isLoggingOutOpen, setIsLoggingOutOpen] = useState(false);

    const performLogout = () => {
      authStore.logout();
      const location = isSAMLEnabled() ? '/logged-out' : '/';
      history.replace(location);
    };

    return (
      <Container className='top-nav'>
        <Menu fluid borderless fixed='top'>
          <Menu.Menu position='left'>
            <Menu.Item header as={Link} to='/'>
              <Menu.Header style={{ display: 'flex', alignItems: 'center' }}>
                <SharecareLogo width={22} style={{ marginRight: '.5em' }} />
                <span>{t('Care Console')}</span>
              </Menu.Header>
            </Menu.Item>
            {showNav &&
              totalSortedComponents.map(([category, components], i) =>
                components.length > 1 ? (
                  <Dropdown
                    key={category}
                    item
                    text={(activeModule && activeModule.title) || category}
                  >
                    <Dropdown.Menu className='main-dropdown'>
                      {sortBy(components, ['isSystemModule', 'title']).map(
                        (component, j) => {
                          const isFirstSystemModule = component => {
                            const systemComponents = components.filter(
                              ({ isSystemModule }) => isSystemModule
                            );
                            return (
                              systemComponents.length !== 0 &&
                              systemComponents[0] === component
                            );
                          };
                          const getAllSystemModules = () => {
                            return components.filter(
                              ({ isSystemModule }) => isSystemModule
                            );
                          };
                          if (
                            component.isSystemModule &&
                            isFirstSystemModule(component)
                          ) {
                            return (
                              <React.Fragment key='FirstSystemModule'>
                                <Dropdown.Item>
                                  {`${t('SYSTEM MODULES')} (${
                                    getAllSystemModules().length
                                  })`}
                                </Dropdown.Item>
                                <Dropdown.Item
                                  as={Link}
                                  key={`page_${i}_${j}`}
                                  to={`/${component.path}`}
                                >
                                  {component.title}
                                </Dropdown.Item>
                              </React.Fragment>
                            );
                          }
                          return (
                            <Dropdown.Item
                              as={Link}
                              key={`page_${i}_${j}`}
                              to={`/${component.path}`}
                            >
                              {component.title}
                            </Dropdown.Item>
                          );
                        }
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Menu.Item
                    as={Link}
                    key={`page_${i}`}
                    to={`/${components[0].path}`}
                  >
                    {t(components[0].title)}
                  </Menu.Item>
                )
              )}
          </Menu.Menu>
          <Menu.Menu className='top-nav-sponsor'>
            {sponsorStore.multiSponsor ? (
              authStore.isLoggedIn && (
                <Item
                  style={{ display: 'flex', width: '100%', padding: '0 0 0 0' }}
                >
                  <TopmostSponsorSelect
                    sponsors={sponsorStore.sponsors}
                    loadingSponsors={sponsorStore.loading}
                    allSponsor={configStore.allSponsor}
                    defaultSponsor={{
                      ...sponsorStore.ALL_SPONSORS,
                      isGlobal: true
                    }}
                    multiSponsor={configStore.multiSponsor}
                    global={sponsorStore.global}
                    sponsorId={sponsorId}
                    preText={'Viewing:'}
                    onSponsorChange={value => {
                      if (showTasksMenu) {
                        handleTasksMenu();
                      }
                      if (!checkIfComponentProcessesSponsorChange())
                        sponsorStore.setSponsor(value, sessionStorage);
                      else sponsorStore.requestedSponsor = value;
                    }}
                    minWidth={274}
                  />
                </Item>
              )
            ) : (
              <Menu.Item>{sponsorName}</Menu.Item>
            )}
          </Menu.Menu>
          <Menu.Menu>
            <Menu.Menu position='right'>
              {showUserNotifications && <UserNotifications history={history} />}
              {showTasksMenu && (
                <Popup
                  key='top-nav-popup'
                  className='tasks-menu'
                  trigger={
                    <Menu.Item as='a' id='topNavTasks'>
                      <div>
                        <Icon
                          name='tasks'
                          style={{
                            color: `${
                              casesTasksStore.totalTaskCount
                                ? '#ff952c'
                                : '#929292'
                            }`
                          }}
                        />
                        {t('Tasks ')}
                        {casesTasksStore.loading && (
                          <Loader
                            active={casesTasksStore.loading}
                            size='mini'
                            inline
                          />
                        )}
                        {!casesTasksStore.loading &&
                          `(${casesTasksStore.openTasksCount || 0})`}
                      </div>
                    </Menu.Item>
                  }
                  content={<TasksModalComponent history={history} />}
                  position='bottom right'
                  on='click'
                  size='large'
                />
              )}
              {showNav && <TopNavAccountMenuItem history={history} profileStore={profileStore} authStore={authStore} />}
              {showNav && systemComponents.length > 0 && (
                <Popup
                  className='tools-menu'
                  trigger={
                    <Menu.Item as='a'>
                      <ToolsIcon fill='#000' height={15} width={15} />
                      <span style={{ marginLeft: '5px' }}>{t('Tools')}</span>
                    </Menu.Item>
                  }
                  content={
                    <TopNavToolsContent
                      systemComponents={sortBy(systemComponents, ['title'])}
                      onItemClicked={() => {
                        setIsToolsOpen(false);
                      }}
                    />
                  }
                  wide
                  open={isToolsOpen}
                  onOpen={() => setIsToolsOpen(true)}
                  onClose={() => setIsToolsOpen(false)}
                  position='bottom left'
                  on='click'
                  hideOnScroll
                />
              )}

              {showNav && (
                <Menu.Item as='a'>
                  <Icon name='help circle' style={{ color: '#000' }} />
                  <span style={{ marginLeft: '5px' }}>{t('Help')}</span>
                </Menu.Item>
              )}

              {showNav && (
                <Menu.Item
                  onClick={async () => {
                    if (authStore.isAdvocateUser) {
                      GlobalEventsListener.addListener({
                        type: 'fiveNineLogoutComplete',
                        onEvent: () => {
                          setIsLoggingOutOpen(false);
                          performLogout();
                        }
                      });
                      setIsLoggingOutOpen(true);
                      GlobalEventsListener.dispatchEvent({
                        type: 'fiveNineForceLogout'
                      });
                    } else {
                      performLogout();
                    }
                  }}
                >
                  {t('Logout')}
                </Menu.Item>
              )}
              {isLoggingOutOpen && (
                <Modal open dimmer='inverted'>
                  <div
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '24px',
                      position: 'absolute',
                      zIndex: '1000',
                      width: '100%',
                      top: '50%',
                      marginTop: '-50px',
                      marginLeft: '-20px'
                    }}
                  >
                    {t('Logging out of dialer...')}
                  </div>
                  <LoadingSegment basic />
                </Modal>
              )}
            </Menu.Menu>
          </Menu.Menu>
        </Menu>
      </Container>
    );
  }
);
TopNav.propTypes = {
  components: PropTypes.arrayOf(PropTypes.object),
  location: routerPropTypes.location.isRequired,
  history: routerPropTypes.history.isRequired
};

export default withRouter(TopNav);

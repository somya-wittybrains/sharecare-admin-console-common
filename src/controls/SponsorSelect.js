import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Dropdown, Input } from 'semantic-ui-react';
import Text from './Text';
import { t } from 'translate';
import { useAppModelStore } from  '../model/hooks';
import { renderSponsorIcon } from  '../model/formatters';
import { sortBy } from 'lodash';
import { observer } from 'mobx-react-lite';

const SponsorSelect = observer(({
  headerText = '',
  content,
  ...props

}) =>
{
  const { sponsorStore }  = useAppModelStore();
  const [filterName, setFilterName] = useState('');
  const sponsorId = sponsorStore.getSponsorId(sessionStorage);
  const sponsorName = sponsorStore.getSponsorName(sessionStorage);

  return (<Card {...props}>
          <Card.Content>
            <Card.Header>{headerText}</Card.Header>
            <Card.Description>
             {content}
            </Card.Description>
          </Card.Content>
          <Card.Content>
            <Dropdown
              scrolling
              item
              value={sponsorId}
              trigger={
                sponsorStore.multiSponsor ? (
                  <Text>
                    <span>{t('Select:')}&nbsp;</span>
                    <Text as='span' level='primary'>
                      {sponsorName}
                    </Text>
                  </Text>
                ) : undefined
              }
              fluid
              inline
              clearable={sponsorStore.global}
              onChange={(_, value) =>
                sponsorStore.setSponsor(value, sessionStorage)
              }
            >
              <Dropdown.Menu>
                <Input
                  icon='search'
                  iconPosition='left'
                  className='search'
                  value={filterName}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e, { value }) => {
                    e.stopPropagation();
                    setFilterName(value);
                  }}
                />
                <Dropdown.Header />
                {sortBy(
                  sponsorStore.sponsors.filter(
                    ({ name }) =>
                      !filterName ||
                      (filterName &&
                        name &&
                        name.toLowerCase().indexOf(filterName.toLowerCase()) !==
                          -1)
                  ),
                  'name'
                ).map((sponsor) => (
                  <Dropdown.Item
                    key={`sponsor-option-${sponsor.id}`}
                    value={sponsor.id}
                    onClick={() =>
                      sponsorStore.setSponsor(sponsor.id, sessionStorage)
                    }
                    active={sponsor.id === sponsorId}
                  >
                    {renderSponsorIcon(sponsor, false, false, null, 5)}
                    {sponsor.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Card.Content>
        </Card>);
});

SponsorSelect.propTypes = {
  header: PropTypes.string,
  content: PropTypes.object
};
export default SponsorSelect;
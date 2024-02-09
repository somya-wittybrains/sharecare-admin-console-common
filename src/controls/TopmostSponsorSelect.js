import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Input } from 'semantic-ui-react';
import { sortBy } from 'lodash';
import { t } from 'translate';
import { renderSponsorIcon } from 'model/formatters';
import { ReactComponent as MultiSponsorLogo } from './multisponsor.svg';
import './TopmostSponsorSelect.less';

const debug = require('debug')('controls.TopmostSponsorSelect');

const TopmostSponsorSelect = observer(
  ({
    onSponsorChange,
    loadingSponsors,
    sponsors,
    sponsorId,
    allSponsor,
    multiSponsor,
    defaultSponsor,
    preText,
    ...props
  }) => {
    debug('render()');
    const [filterName, setFilterName] = useState('');
    const EnterpriseSponsorCss = {
      color: '#00bfa5',
      whiteSpace: 'nowrap'
    };

    const CommunitySponsorCss = {
      color: '#66a2e7',
      whiteSpace: 'nowrap'
    };

    const ProviderSponsorCss = {
      color: '#ce0c6e',
      whiteSpace: 'nowrap'
    };

    const GlobalSponsorCss = {
      color: '#2987cd',
      whiteSpace: 'nowrap'
    };

    const ConsumerSponsorCss = {
      whiteSpace: 'nowrap',
      fontWeight: 'bold',
      color: '#000000'
    };

    const GlobalMultiSponsorCss = {
      color: '#da2f76',
      whiteSpace: 'nowrap',
      fontWeight: '600 '
    };
    const selectedSponsor =
      sponsors.find(({ name, id }) => id === sponsorId) || defaultSponsor;
    const sponsorNameStyle = ({ sponsor, allSponsor }) => {
      if (sponsor) {
        if (sponsor.isGlobal && allSponsor) return GlobalSponsorCss;
        if (sponsor.isGlobal && !allSponsor) return GlobalMultiSponsorCss;
        if (sponsor.isConsumer) return ConsumerSponsorCss;
        if (sponsor.isCommunity) return CommunitySponsorCss;
        if (sponsor.isHealthSystem) return ProviderSponsorCss;
      }
      return EnterpriseSponsorCss;
    };

    useEffect(() => {
      setFilterName('');
    }, [sponsorId, setFilterName]);
    return (
      <Dropdown
        style={{ ...props }}
        selection
        className={'sponsors-dropdown'}
        scrolling
        item
        value={sponsorId}
        trigger={
          multiSponsor ? (
            <div className='inline-items'>
              {preText && (
                <span className='view-span' style={{ paddingRight: 8 }}>
                  {preText}&nbsp;
                </span>
              )}
              {!loadingSponsors &&
                (allSponsor || sponsorId) &&
                renderSponsorIcon(selectedSponsor, false, false, null, 5)}
              {!loadingSponsors && !sponsorId && !allSponsor && (
                <MultiSponsorLogo width={24} height={24} />
              )}
              <label
                style={sponsorNameStyle({
                  sponsor: selectedSponsor,
                  allSponsor: allSponsor
                })}
              >
                {selectedSponsor.name}
              </label>
            </div>
          ) : (
            undefined
          )
        }
        fluid
        inline
        clearable={!!sponsorId && !loadingSponsors}
        loading={loadingSponsors}
        onChange={(_, { value }) => {
          onSponsorChange(value);
        }}
      >
        <Dropdown.Menu>
          <Dropdown.Item
            className={allSponsor ? null : 'multi-sponsor-text'}
            value={null}
            onClick={() => {
              onSponsorChange(null);
            }}
            active={!sponsorId}
          >
            {!loadingSponsors &&
              allSponsor &&
              renderSponsorIcon(defaultSponsor, false, false, null, 5)}
            {!loadingSponsors && !allSponsor && (
              <MultiSponsorLogo width={24} height={24} />
            )}
            {allSponsor
              ? t('All Sponsors')
              : `Multi-Sponsor (${sponsors.length})`}
          </Dropdown.Item>
          <Dropdown.Header content={t('SELECT SPONSOR')} />
          <Input
            icon='search'
            iconPosition='left'
            className='search'
            value={filterName}
            onClick={e => e.stopPropagation()}
            onChange={(e, { value }) => {
              e.stopPropagation();
              setFilterName(value);
            }}
          />
          {sortBy(
            sponsors.filter(
              ({ name }) =>
                !filterName ||
                (filterName &&
                  name &&
                  name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1)
            ),
            'name'
          ).map(sponsor => (
            <Dropdown.Item
              key={`sponsor-option-${sponsor.id}`}
              value={sponsor.id}
              onClick={() => {
                onSponsorChange(sponsor.id);
              }}
              active={sponsor.id === sponsorId}
            >
              {renderSponsorIcon(sponsor)}
              {sponsor.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
);
export default TopmostSponsorSelect;

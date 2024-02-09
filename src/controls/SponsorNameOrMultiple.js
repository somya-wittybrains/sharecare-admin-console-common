import React from 'react';
import { t } from 'translate';
import { Popup } from 'semantic-ui-react';
import { renderSponsorIcon } from 'model/formatters';
import { useAppModelStore } from '../model/hooks';

const SponsorNameOrMultiple = ({
  sponsors,
  displayName = false,
  displayMultiple = false
}) => {
  const { sponsorStore } = useAppModelStore();
  if (sponsors.length === 0) return <React.Fragment />;
  if (sponsors.length > 1)
    return (
      <Popup
        inverted
        content={
          <React.Fragment>
            {sponsors.map(sponsorId => (
              <div key={sponsorId}>
                {renderSponsorIcon(
                  sponsorStore.getSponsorById(sponsorId),
                  true,
                  true,
                  '#FFF',
                  5
                )}
              </div>
            ))}
          </React.Fragment>
        }
        trigger={
          <span
            style={{
              color: '#008df2',
              textDecoration: 'underline'
            }}
          >
            {displayMultiple && `${t('Multiple')} `}
            {`(${sponsors.length})`}
          </span>
        }
      />
    );
  if (sponsors.length === 1)
    return sponsors.map(sponsorId =>
      renderSponsorIcon(
        sponsorStore.getSponsorById(sponsorId),
        !displayName,
        displayName
      )
    );
};

export default SponsorNameOrMultiple;

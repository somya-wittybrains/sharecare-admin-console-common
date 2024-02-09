import React from 'react';
import { Image,Dropdown } from 'semantic-ui-react';
import GracefulIcon from 'controls/GracefulIcon';
import { Link } from 'react-router-dom';

const TopNavToolsContent = ({ systemComponents, onItemClicked }) => {
  return (
    <div>
      {systemComponents.map(
        ({ name, title, path, iconComponent }, index, array) => {
          const itemStyle = {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 14px'
          };
          if (array.length - 1 !== index) {
            itemStyle.borderBottom = '1px solid #2224261a';
          }
          return (
            <Dropdown.Item
              key={name}
              as={Link}
              to={`/${path}`}
              onClick={onItemClicked}
              style={itemStyle}
            >
              <Image
                as={GracefulIcon}
                path={iconComponent}
                centered
                style={{
                  height: 20,
                  width: 20,
                  marginTop: 1,
                  marginRight: 10,
                  background: 'none',
                  color: 'rgb(26, 186, 156)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              />
              <div
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  fontFamily:
                    'Lato, "Helvetica Neue", Arial, Helvetica, sans-serif',
                  fontWeight: 'bold',
                  color: '#0009'
                }}
              >
                {title}
              </div>
            </Dropdown.Item>
          );
        }
      )}
    </div>
  );
};
export default TopNavToolsContent;
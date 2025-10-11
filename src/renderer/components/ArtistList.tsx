import { useCallback } from 'react';
import { Avatar, Col, Flex, Row, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { type Artist } from '../api';

export type ArtistListProps = {
  singers: { artists: Artist[]; artistNames: string[] };
};

export default function ArtistList({ singers }: ArtistListProps) {
  const { artistNames, artists } = singers;
  const navigate = useNavigate();

  const navigateToArtist = useCallback(
    (name: string, pic = '') => {
      navigate(`/artists/${name}?pic=${encodeURIComponent(pic)}`);
    },
    [navigate],
  );

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {artists.map(({ name, pic }) => (
          <Col key={name} span={6}>
            <Flex vertical align="center" gap="small">
              <Avatar
                onClick={() => {
                  navigateToArtist(name, pic);
                }}
                src={pic}
                size={96}
                style={{ cursor: 'pointer' }}
              />
              <Typography.Text
                className="link"
                style={{ fontSize: 16 }}
                onClick={() => {
                  navigateToArtist(name, pic);
                }}
              >
                {name}
              </Typography.Text>
            </Flex>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} align="middle">
        {artistNames.map((name) => (
          <Col key={name} span={6} style={{ textAlign: 'center' }}>
            <Typography.Text
              className="link"
              style={{ fontSize: 16 }}
              onClick={() => {
                navigateToArtist(name);
              }}
            >
              {name}
            </Typography.Text>
          </Col>
        ))}
      </Row>
    </>
  );
}

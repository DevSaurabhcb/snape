/* eslint-disable react/forbid-prop-types */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import withRedux from 'next-redux-wrapper';
import initStore from '../store';
import Layout from '../components/Layout';
import DownloadTile, { ContentTitle, Details, Name, IconWrapper } from '../components/DownloadTile';
import DownloadMenu from '../components/DownloadMenu';
import { FixedWidthDiv } from '../utils/commonStyles';

@withRedux(initStore, ({ download, cast }) => ({
  download,
  cast,
}))
export default class Download extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    download: PropTypes.array.isRequired,
    cast: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      downloadData: [],
      selectedIndex: null,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      ipcRenderer.send('get_download_data');
    }, 1000);

    ipcRenderer.on('download_data', (event, downloadData) => {
      this.setState({ downloadData });
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    ipcRenderer.removeAllListeners(['download_data', 'get_download_data']);
  }

  setSelectedIndex = (i) => {
    this.setState({
      selectedIndex: this.state.selectedIndex === i ? null : i,
    });
  };

  getDownloads = () => {
    const content = this.props.download.map((d, i) =>
      (<DownloadTile
        details={d}
        index={i}
        key={d.infoHash}
        dispatch={this.props.dispatch}
        downloadData={this.state.downloadData[d.infoHash]}
        onClick={this.setSelectedIndex}
        selectedIndex={this.state.selectedIndex}
      />),
    );

    return (
      <div>
        <DownloadMenu dispatch={this.props.dispatch} />
        {content.length > 0 &&
          <div style={{ height: 'calc(100vh - 190px)', overflow: 'scroll' }}>
            <ContentTitle className="text-bold">
              <FixedWidthDiv width="30px" />
              <FixedWidthDiv width="40px" />
              <Name>Name</Name>
              <Details>
                <div>Progress</div>
                <div><i className="mdi mdi-download" />/s</div>
                <div><i className="mdi mdi-upload" />/s</div>
                <div>Size</div>
                <IconWrapper />
                <IconWrapper />
              </Details>
            </ContentTitle>
            {content}
          </div>}
      </div>
    );
  };

  render() {
    const { cast, download, dispatch } = this.props;
    return (
      <Layout cast={cast} download={download} dispatch={dispatch}>
        {this.getDownloads()}
      </Layout>
    );
  }
}

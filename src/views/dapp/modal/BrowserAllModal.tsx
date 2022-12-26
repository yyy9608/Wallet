import { connect } from "react-redux";
import { ApproveAccountModal } from "./ApproveAccountModal";
import { ApproveSigntureModal } from "./ApproveSigntureModal";
import { AddToeknModal } from "./AddTokenModal";
import { SwitchNetworkModal } from './SwitchNetworkModal';
import { AddNetworkModal } from './AddNetworkModal';
import { ApproveTransferModal } from "./ApproveTransferModal";

const BrowserAllModal = (props: any) => {
  return (
    <>
      <ApproveAccountModal key='approve-login' {...props} />
      <ApproveSigntureModal key='approve-signture' {...props} />
      <AddToeknModal key='add-token' {...props} />
      <SwitchNetworkModal key='switch-network' {...props} />
      <AddNetworkModal key='add-network' {...props} />
      <ApproveTransferModal key='approve-transfer' {...props} />
    </>
  )
}

const mapStateToProps = (state: any) => {
  return {
    active_account: JSON.parse(state.activeAccount),
    active_network: JSON.parse(state.activeNetwork),
    network_list: JSON.parse(state.networkList)
  }
};

export default connect(mapStateToProps)(BrowserAllModal);
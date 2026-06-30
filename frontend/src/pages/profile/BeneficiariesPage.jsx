import React from 'react';
import { useNavigate } from 'react-router-dom';
import CrudResourcePage from '../../components/common/CrudResourcePage';
import StatusBadge from '../../components/common/StatusBadge';
import { userApi } from '../../services/userApi';

const blank = { name: '', email: '', bankName: '', accountNumberLast4: '', ifsc: '', nickname: '', isFavorite: false };

export default function BeneficiariesPage() {
  const navigate = useNavigate();

  return (
    <CrudResourcePage
      title="Beneficiaries"
      subtitle="Manage saved recipients for faster payments."
      blank={blank}
      fields={[
        { label: 'Name', name: 'name', required: true },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Bank Name', name: 'bankName' },
        { label: 'Account Last 4', name: 'accountNumberLast4' },
        { label: 'IFSC', name: 'ifsc' },
        { label: 'Nickname', name: 'nickname' },
        { label: 'Favorite', name: 'isFavorite', type: 'checkbox' }
      ]}
      listApi={userApi.listBeneficiaries}
      createApi={userApi.createBeneficiary}
      updateApi={userApi.updateBeneficiary}
      deleteApi={userApi.deleteBeneficiary}
      mapItemToForm={(item) => ({
        name: item.name || '',
        email: item.email || '',
        bankName: item.bankName || '',
        accountNumberLast4: item.accountNumberLast4 || '',
        ifsc: item.ifsc || '',
        nickname: item.nickname || '',
        isFavorite: Boolean(item.isFavorite)
      })}
      getItemTitle={(item) => (
        <>
          {item.name}
          {item.isFavorite ? <i className="bi bi-star-fill text-warning ms-1" /> : null}
        </>
      )}
      renderItemMeta={(item) => (
        <>
          <div className="text-muted-sp small">{item.email || item.nickname || '-'}</div>
          <div className="text-muted-sp small">{item.bankName || '-'} {item.accountNumberLast4 ? `· ****${item.accountNumberLast4}` : ''}</div>
        </>
      )}
      renderBadges={(item) => <StatusBadge status={item.status} />}
      extraActions={(item, reload) => (
        <>
          {item.email && (
            <button className="btn btn-sm btn-sp-primary" onClick={() => navigate(`/wallet/send?recipient=${encodeURIComponent(item.email)}`)}>
              Transfer
            </button>
          )}
          <button
            className="btn btn-sm btn-sp-outline"
            onClick={async () => {
              await userApi.favoriteBeneficiary(item._id, !item.isFavorite);
              await reload();
            }}
          >
            {item.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>
        </>
      )}
      confirmDeleteMessage="Delete this beneficiary?"
      loadErrorMessage="Unable to load beneficiaries"
      saveErrorMessage="Unable to save beneficiary"
    />
  );
}

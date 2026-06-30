import React from 'react';
import CrudResourcePage from '../../components/common/CrudResourcePage';
import { userApi } from '../../services/userApi';

const blank = { name: '', relationship: '', phone: '', email: '', address: '', sharePercentage: 100 };

export default function NomineesPage() {
  return (
    <CrudResourcePage
      title="Nominees"
      subtitle="Manage nominees for your SecurePay account."
      blank={blank}
      fields={[
        { label: 'Name', name: 'name', required: true },
        { label: 'Relationship', name: 'relationship', required: true },
        { label: 'Phone', name: 'phone' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Address', name: 'address' },
        { label: 'Share Percentage', name: 'sharePercentage', type: 'number' }
      ]}
      listApi={userApi.listNominees}
      createApi={userApi.createNominee}
      updateApi={userApi.updateNominee}
      deleteApi={userApi.deleteNominee}
      mapItemToForm={(item) => ({
        name: item.name || '',
        relationship: item.relationship || '',
        phone: item.phone || '',
        email: item.email || '',
        address: item.address || '',
        sharePercentage: item.sharePercentage || 100
      })}
      preparePayload={(form) => ({ ...form, sharePercentage: Number(form.sharePercentage || 100) })}
      getItemTitle={(item) => item.name}
      renderItemMeta={(item) => (
        <>
          <div className="text-muted-sp small">{item.relationship} · {item.sharePercentage}%</div>
          <div className="text-muted-sp small">{item.phone || '-'} {item.email ? `· ${item.email}` : ''}</div>
        </>
      )}
      confirmDeleteMessage="Delete this nominee?"
      loadErrorMessage="Unable to load nominees"
      saveErrorMessage="Unable to save nominee"
    />
  );
}

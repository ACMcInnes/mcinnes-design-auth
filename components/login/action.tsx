'use server'
  
export async function getWebstore(initialState: { message: string; webstore: string; environment: string; }, formData: FormData) {
  const webstore = formData.get('webstore') ?? '';
  let environment = 'production';
  if (webstore) {
    if (webstore.toString().includes('.uat.neto.net.au') || webstore.toString().includes('.uat.mymaropost.net')) {
      environment = 'uat'
    }
    if (webstore.toString().includes('.staging-aws.neto.net.au') || webstore.toString().includes('.staging.mymaropost.net')) {
      environment = 'staging'
    }
    return {
      message: `${webstore} is in ${environment}`,
      webstore: `${webstore.toString().replace(/^https?:\/\//, '').replace(/\/$/, '')}`,
      environment: `${environment}`
    };
  } else {
    return {
      message: 'Error: URL not a valid webstore',
      webstore: '',
      environment: '',
    };
  }
}

export type LoanTemplate = {
  id: string;
  title: string;
  lender: string;
  principalToman: number;
  rate: number;
  term: number;
  description: string;
};

export const LOAN_TEMPLATES: LoanTemplate[] = [
  { id: 'rent', title: 'وام ودیعه مسکن', lender: 'بانک', principalToman: 365000000, rate: 23, term: 60, description: 'قالب آماده برای هزینه ودیعه و مدیریت اقساط' },
  { id: 'marriage', title: 'وام ازدواج', lender: 'بانک', principalToman: 300000000, rate: 4, term: 60, description: 'قالب ساده برای تعهد بلندمدت' },
  { id: 'home', title: 'وام خرید مسکن', lender: 'بانک', principalToman: 1000000000, rate: 23, term: 120, description: 'مدیریت بدهی و جریان نقدی خرید' },
  { id: 'car', title: 'وام خودرو', lender: 'بانک', principalToman: 500000000, rate: 23, term: 48, description: 'قالب هزینه خودرو' },
  { id: 'personal', title: 'وام شخصی', lender: '', principalToman: 200000000, rate: 23, term: 36, description: 'وام عمومی شخصی' },
  { id: 'business', title: 'وام کسب‌وکار', lender: '', principalToman: 500000000, rate: 18, term: 60, description: 'سرمایه در گردش کسب‌وکار' },
  { id: 'custom', title: 'وام سفارشی', lender: '', principalToman: 0, rate: 0, term: 12, description: 'ساخت از صفر' },
];

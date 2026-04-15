'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ko';

interface Translations {
  [key: string]: {
    en: string;
    ko: string;
  };
}

const translations: Translations = {
  // Navbar
  home: { en: 'Home', ko: '홈' },
  about: { en: 'About', ko: '소개' },
  savings: { en: 'Savings', ko: '비용 절감' },
  dashboard: { en: 'My Dashboard', ko: '내 대시보드' },
  newOrder: { en: 'New Order', ko: '새 주문' },
  login: { en: 'Login', ko: '로그인' },
  getStarted: { en: 'Get Started', ko: '시작하기' },
  logout: { en: 'Logout', ko: '로그아웃' },
  
  // Home
  heroTitle: { en: 'THE FUTURE OF', ko: '미래를 여는' },
  heroSubtitle: { en: 'SHIP BUILDING', ko: '조선 자동화' },
  heroDesc: { en: 'Automated sorting, AI vision inspection, and robotic precision. Reduce costs by up to 40% with Smart Factory welding solutions.', ko: '자동 분류, AI 비전 검사, 그리고 로봇 정밀 제어. 스마트 팩토리 용접 솔루션으로 비용을 최대 40% 절감하세요.' },
  placeOrder: { en: 'Place an Order', ko: '주문하기' },
  calculateSavings: { en: 'Calculate Savings', ko: '절감액 계산' },
  efficiency: { en: 'Efficiency', ko: '효율성' },
  precision: { en: '99.9% Precision', ko: '99.9% 정밀도' },
  costReduction: { en: 'Cost Reduction', ko: '비용 절감' },
  average: { en: '40% Average', ko: '평균 40%' },
  defectRate: { en: 'Defect Rate', ko: '불량률' },
  ngRate: { en: '< 1% NG Rate', ko: '1% 미만 불량률' },
  techTitle: { en: 'Advanced Technology', ko: '첨단 기술' },
  techDesc: { en: 'Our integrated system ensures quality at every step of the production line.', ko: '당사의 통합 시스템은 생산 라인의 모든 단계에서 품질을 보장합니다.' },
  aiVision: { en: 'AI Vision Inspection', ko: 'AI 비전 검사' },
  aiVisionDesc: { en: 'Real-time defect detection using advanced computer vision models.', ko: '고급 컴퓨터 비전 모델을 사용한 실시간 결함 감지.' },
  robotArm: { en: 'Indy 7 Robot Arm', ko: 'Indy 7 로봇 암' },
  robotArmDesc: { en: 'Neuromeka precision robotics for perfect pick-and-place operations.', ko: '완벽한 픽앤플레이스 작업을 위한 뉴로메카 정밀 로봇 공학.' },
  smartWelding: { en: 'Smart Welding', ko: '스마트 용접' },
  smartWeldingDesc: { en: 'Automated welding systems that outperform conventional manual methods.', ko: '기존 수동 방식을 능가하는 자동 용접 시스템.' },
  plcIntegration: { en: 'PLC Integration', ko: 'PLC 통합' },
  plcIntegrationDesc: { en: 'Mitsubishi MELSEC protocol for seamless production flow control.', ko: '원활한 생산 흐름 제어를 위한 미쓰비시 MELSEC 프로토콜.' },
  shipsBuiltWithUs: { en: 'SHIPS BUILT WITH US', ko: '우리와 함께 만드는 선박' },
  costLess: { en: 'COST LESS.', ko: '비용이 더 적게 듭니다.' },
  savingsTeaserDesc: { en: 'Conventional manual welding is slow and prone to errors. Our automated system slashes cycle times and virtually eliminates rework costs.', ko: '기존의 수동 용접은 느리고 오류가 발생하기 쉽습니다. 당사의 자동화 시스템은 사이클 타임을 대폭 단축하고 재작업 비용을 거의 제거합니다.' },
  seeBreakdown: { en: 'See the breakdown in our Savings Calculator', ko: '비용 절감 계산기에서 상세 내역 확인하기' },
  conventionalTime: { en: 'Conventional Time', ko: '기존 소요 시간' },
  smartFactoryTime: { en: 'Smart Factory Time', ko: '스마트 팩토리 소요 시간' },
  labourSavings: { en: '80% Savings', ko: '80% 절감' },
  onLabourCosts: { en: 'On Labour Costs', ko: '인건비 기준' },

  // About
  aboutUs: { en: 'ABOUT US', ko: '회사 소개' },
  aboutDesc: { en: 'Pioneering the next generation of maritime manufacturing through automation and artificial intelligence.', ko: '자동화와 인공지능을 통해 차세대 해양 제조를 선도합니다.' },
  mission: { en: 'Our Mission', ko: '우리의 사명' },
  missionTitle: { en: 'REDEFINING EFFICIENCY IN SHIPBUILDING', ko: '조선업의 효율성 재정의' },
  missionDesc1: { en: 'Smart Factory was founded with a single goal: to solve the inefficiencies of conventional shipbuilding. By integrating robotics, computer vision, and real-time data, we\'ve created a system that doesn\'t just work faster—it works smarter.', ko: '스마트 팩토리는 기존 조선업의 비효율성을 해결한다는 단 하나의 목표로 설립되었습니다. 로봇 공학, 컴퓨터 비전 및 실시간 데이터를 통합하여 더 빠르게 작동할 뿐만 아니라 더 스마트하게 작동하는 시스템을 구축했습니다.' },
  missionDesc2: { en: 'Our automated sorting and welding system reduces human error, minimizes waste, and ensures that every sub-assembly meets the highest standards of maritime safety.', ko: '당사의 자동 분류 및 용접 시스템은 인적 오류를 줄이고 낭비를 최소화하며 모든 서브 어셈블리가 해양 안전의 최고 표준을 충족하도록 보장합니다.' },
  sortingSystem: { en: 'THE AUTO SORTING SYSTEM', ko: '자동 분류 시스템' },
  sortingDesc: { en: 'A look inside our state-of-the-art production line.', ko: '당사의 최첨단 생산 라인을 살펴보세요.' },
  creditTitle: { en: 'CREDIT & RECOGNITION', ko: '감사 및 인정' },
  creditDesc: { en: 'This project was made possible through the intensive training and support provided by the Maritime Training Organization. Their commitment to digital transformation in the shipping industry continues to drive innovation globally.', ko: '이 프로젝트는 해양 교육 기관의 집중적인 교육과 지원을 통해 가능해졌습니다. 해운 산업의 디지털 전환에 대한 그들의 헌신은 전 세계적으로 혁신을 계속 주도하고 있습니다.' },

  // Savings Calculator
  parameters: { en: 'Project Scope', ko: '프로젝트 범위' },
  numAssemblies: { en: 'Number of Sub-Assemblies', ko: '서브 어셈블리 수' },
  shipType: { en: 'Ship Type', ko: '선박 종류' },
  shipTypeBulkCarrier:       { en: 'Bulk Carrier',       ko: '벌크 운반선' },
  shipTypeContainerShip:     { en: 'Container Ship',     ko: '컨테이너선' },
  shipTypeTanker:            { en: 'Tanker',             ko: '탱커' },
  shipTypeLNGCarrier:        { en: 'LNG Carrier',        ko: 'LNG 운반선' },
  shipTypeNavalVessel:       { en: 'Naval Vessel',       ko: '해군 함정' },
  shipTypeOffshorePlatform:  { en: 'Offshore Platform',  ko: '해양 플랫폼' },
  shipTypeFerry:             { en: 'Ferry',              ko: '페리' },
  conventionalMethod: { en: 'Conventional Method', ko: '기존 방식' },
  smartFactory: { en: 'Smart Factory', ko: '스마트 팩토리' },
  totalCost: { en: 'Total Cost', ko: '총 비용' },
  cycleTime: { en: 'Ship Construction Period', ko: '선박건조기간' },
  cycleTimeConventional: { en: '14 months', ko: '14개월' },
  cycleTimeSmart: { en: '3 months', ko: '3개월' },
  totalSavings: { en: 'Total Savings', ko: '총 절감액' },
  costReductionTitle: { en: 'Cost Reduction', ko: '비용 절감' },
  readyToSave: { en: 'Ready to save? Place your order', ko: '절감할 준비가 되셨나요? 지금 주문하세요' },
  savingsPageDesc: { en: 'Compare the costs of conventional welding vs. our Smart Factory solution.', ko: '기존 용접 방식과 스마트 팩토리 솔루션의 비용을 비교하세요.' },
  baseMaterial: { en: 'Base Material', ko: '기본 재료비' },
  savingsSummaryDesc: { en: 'Based on {qty} sub-assemblies for a {ship}', ko: '{ship} 기준 서브 어셈블리 {qty}개 기준' },

  // Auth
  welcomeBack: { en: 'Welcome Back', ko: '다시 오신 것을 환영합니다' },
  loginDesc: { en: 'Login to manage your ship part orders.', ko: '로그인하여 선박 부품 주문을 관리하세요.' },
  emailAddress: { en: 'Email Address', ko: '이메일 주소' },
  password: { en: 'Password', ko: '비밀번호' },
  noAccount: { en: "Don't have an account?", ko: '계정이 없으신가요?' },
  registerHere: { en: 'Register here', ko: '여기에서 등록하세요' },
  createAccount: { en: 'Create Account', ko: '계정 생성' },
  registerDesc: { en: 'Join Smart Factory to start your automated production.', ko: '스마트 팩토리에 가입하여 자동화 생산을 시작하세요.' },
  companyName: { en: 'Company Name', ko: '회사명' },
  contactName: { en: 'Contact Name', ko: '담당자명' },
  phoneNumber: { en: 'Phone Number', ko: '전화번호' },
  alreadyHaveAccount: { en: 'Already have an account?', ko: '이미 계정이 있으신가요?' },

  // Order
  placeNewOrder: { en: 'PLACE NEW ORDER', ko: '새 주문하기' },
  configure: { en: 'Configure', ko: '구성' },
  details: { en: 'Details', ko: '상세 정보' },
  review: { en: 'Review', ko: '검토' },
  buildSubAssembly: { en: 'Build Sub-Assembly', ko: '서브 어셈블리 구축' },
  selectPart1: { en: 'Select Part 1 (Hull Block)', ko: '부품 1 선택 (선체 블록)' },
  selectPart2: { en: 'Select Part 2 (Piping/Structural)', ko: '부품 2 선택 (배관/구조)' },
  choosePart: { en: 'Choose a part...', ko: '부품을 선택하세요...' },
  addToOrder: { en: 'Add to Order', ko: '주문에 추가' },
  subAssemblies: { en: 'Sub-Assemblies', ko: '서브 어셈블리' },
  cartEmpty: { en: 'Your cart is empty. Add sub-assemblies to continue.', ko: '장바구니가 비어 있습니다. 계속하려면 서브 어셈블리를 추가하세요.' },
  materialCost: { en: 'Material Cost', ko: '재료비' },
  dueDate: { en: 'Due Date', ko: '납기일' },
  priority: { en: 'Priority', ko: '우선순위' },
  urgent: { en: 'Urgent', ko: '긴급' },
  high: { en: 'High', ko: '높음' },
  medium: { en: 'Medium', ko: '중간' },
  low: { en: 'Low', ko: '낮음' },
  veryLow: { en: 'Very Low', ko: '매우 낮음' },
  notes: { en: 'Notes', ko: '비고' },
  specialInstructions: { en: 'Any special instructions...', ko: '특별 요청 사항...' },
  orderSummary: { en: 'Order Summary', ko: '주문 요약' },
  totalItems: { en: 'Total Items', ko: '총 품목 수' },
  itemBreakdown: { en: 'Item Breakdown', ko: '품목 내역' },
  costSummary: { en: 'Cost Summary', ko: '비용 요약' },
  subtotal: { en: 'Subtotal', ko: '소계' },
  estSavings: { en: 'Estimated Savings', ko: '예상 절감액' },
  totalEst: { en: 'Total Estimated', ko: '총 예상 비용' },
  continue: { en: 'Continue', ko: '계속하기' },
  goBack: { en: 'Go Back', ko: '뒤로 가기' },
  smartAdvantage: { en: 'Smart Advantage', ko: '스마트 이점' },
  smartAdvantageDesc: { en: 'By using our automated sorting system, you\'re saving approximately 40% on labour and rework costs compared to conventional methods.', ko: '당사의 자동 분류 시스템을 사용하면 기존 방식에 비해 인건비 및 재작업 비용을 약 40% 절감할 수 있습니다.' },

  // Dashboard
  overview: { en: 'Overview', ko: '개요' },
  totalOrders: { en: 'Total Orders', ko: '총 주문' },
  inProgress: { en: 'In Progress', ko: '진행 중' },
  completed: { en: 'Completed', ko: '완료됨' },
  recentOrders: { en: 'Recent Orders', ko: '최근 주문' },
  viewAll: { en: 'View All', ko: '모두 보기' },
  noOrders: { en: 'No orders found. Place your first order to get started!', ko: '주문이 없습니다. 시작하려면 첫 주문을 하세요!' },
  orderId: { en: 'Order ID', ko: '주문 ID' },
  status: { en: 'Status', ko: '상태' },
  actions: { en: 'Actions', ko: '작업' },
  view: { en: 'View', ko: '보기' },
  viewDetails: { en: 'View Details', ko: '상세 보기' },
  items: { en: 'Items', ko: '품목' },
  estCost: { en: 'Est. Cost', ko: '예상 비용' },

  // Order Detail
  backToDashboard: { en: 'Back to Dashboard', ko: '대시보드로 돌아가기' },
  cancelOrder: { en: 'Cancel Order', ko: '주문 취소' },
  productionProgress: { en: 'Production Progress', ko: '생산 진행 상황' },
  itemNo: { en: 'Item #', ko: '품목 번호' },
  part1: { en: 'Part 1', ko: '부품 1' },
  part2: { en: 'Part 2', ko: '부품 2' },
  sortBin: { en: 'Sort Bin', ko: '분류 빈' },
  assemblyProgress: { en: 'Assembly Progress', ko: '어셈블리 진행 상황' },
  orderDetails: { en: 'Order Details', ko: '주문 상세 정보' },
  placedOn: { en: 'Placed On', ko: '주문일' },
  realTimeTracking: { en: 'Real-time Tracking', ko: '실시간 추적' },
  realTimeTrackingDesc: { en: 'This page updates automatically as our robots process your order. You\'ll see each sub-assembly move from pending to complete in real-time.', ko: '이 페이지는 로봇이 주문을 처리함에 따라 자동으로 업데이트됩니다. 각 서브 어셈블리가 실시간으로 대기에서 완료로 이동하는 것을 볼 수 있습니다.' },
  confirmCancel: { en: 'Are you sure you want to cancel this order?', ko: '이 주문을 취소하시겠습니까?' },
  level: { en: 'Level', ko: '단계' },
  of: { en: 'of', ko: '/' },
  subAssembliesComplete: { en: 'sub-assemblies complete', ko: '서브 어셈블리 완료' },
  totalEstCost: { en: 'Total Est. Cost', ko: '총 예상 비용' },
  bin: { en: 'Bin', ko: '빈' },
  reason: { en: 'Reason', ko: '사유' },

  // Statuses
  pending: { en: 'Pending', ko: '대기 중' },
  queued: { en: 'Queued', ko: '대기열' },
  in_progress: { en: 'In Progress', ko: '진행 중' },
  complete: { en: 'Complete', ko: '완료' },
  cancelled: { en: 'Cancelled', ko: '취소됨' },
  ng: { en: 'NG', ko: '불량' },

  // OAuth
  continueWithGoogle: { en: 'Continue with Google', ko: 'Google로 계속하기' },
  orDivider: { en: 'or', ko: '또는' },

  // Footer
  footerDesc: { en: 'Revolutionizing the maritime industry through automated welding, AI vision, and robotic precision. Building the future of ship manufacturing, one sub-assembly at a time.', ko: '자동 용접, AI 비전 및 로봇 정밀 제어를 통해 해양 산업을 혁신합니다. 한 번에 하나의 서브 어셈블리씩 조선 제조의 미래를 구축합니다.' },
  company: { en: 'Company', ko: '회사' },
  technology: { en: 'Technology', ko: '기술' },
  careers: { en: 'Careers', ko: '채용' },
  contact: { en: 'Contact', ko: '연락처' },
  address: { en: '123 Innovation Way, Tech District, Busan, South Korea', ko: '대한민국 부산광역시 테크 지구 이노베이션 웨이 123' },
  allRightsReserved: { en: 'All rights reserved.', ko: '모든 권리 보유.' },
  supportedBy: { en: 'Supported by the Maritime Training Organization.', ko: '해양 교육 기관의 지원을 받습니다.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ko');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

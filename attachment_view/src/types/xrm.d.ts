// Dynamics 365 Xrm API の型定義
declare namespace Xrm {
  namespace Utility {
    interface PageContext {
      input: {
        data?: {
          [key: string]: any;
        };
      };
    }

    function getPageContext(): PageContext;
  }
}


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
    function getGlobalContext(): {
      userSettings?: {
        userName?: string;
      };
    };
  }

  namespace Page {
    namespace data {
      namespace entity {
        function getId(): string;
      }
    }
  }

  namespace WebApi {
    function retrieveMultipleRecords(
      entityLogicalName: string,
      queryString?: string
    ): Promise<{
      entities: any[];
    }>;

    function retrieveRecord(
      entityLogicalName: string,
      id: string,
      queryString?: string
    ): Promise<any>;

    function createRecord(
      entityLogicalName: string,
      data: any
    ): Promise<any>;

    function updateRecord(
      entityLogicalName: string,
      id: string,
      data: any
    ): Promise<void>;

    function deleteRecord(
      entityLogicalName: string,
      id: string
    ): Promise<void>;
  }
}


export interface MMIExhibitorDetail {
  exhibitorType: string | null;
  sponsorship: string | null;
  boothNo: string | null;
  hallNo: string | null;
}

export interface MMIEvent {
  showName: string;
  startDate: string;
  endDate: string;
}

export interface MMIExhibitor {
  customer: {
    id: number;
    companyName: string;
    country: string | null;
    squareLogo: string | null;
    userId: string | null;
    showId: number;
    exhibitorDetail: MMIExhibitorDetail | null;
    show: MMIEvent;
  };
}

export interface MMIExhibitorResponse {
  data: {
    catalogueQueries: {
      exhibitorsWithWishListGroup: {
        totalCount: number;
        exhibitors: MMIExhibitor[];
      };
    };
  };
}
export interface MMICategory {
  id: number;
  categoryType: string;
  productCategoryType:
    | "MAINCATEGORY"
    | "CATEGORY"
    | "SUBCATEGORY";
  mainCategory: string;
  categoryName: string;
}

export interface MMICategoryResponse {
  data: {
    catalogueQueries: {
      selectedCustomerCategories: MMICategory[];
    };
  };
}
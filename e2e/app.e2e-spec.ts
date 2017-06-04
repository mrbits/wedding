import { WeddingPage } from './app.po';

describe('wedding App', () => {
  let page: WeddingPage;

  beforeEach(() => {
    page = new WeddingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

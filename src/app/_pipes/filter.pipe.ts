import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
  name: "filter",
  pure: false
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], term, filterBy, filterByAnother): any {
    if (term != null && term != "") {
      if (!term.match(/[a-z]/i)) {
        const a = "+";
        term = term.slice(0) == "+" ? term : a.concat(term);
      }
    }

    return term && filterBy && filterByAnother
      ? items.filter(
        item =>
        item[filterBy].toLowerCase().indexOf(term.toLowerCase()) === 0 ||
        item[filterByAnother].toLowerCase().indexOf(term.toLowerCase()) ===
        0
      )
      : term && filterBy
      ? items.filter(
        item =>
        item[filterBy].toLowerCase().indexOf(term.toLowerCase()) === 0
      )
      : term && !filterBy
      ? items.filter(
        item => item.toLowerCase().indexOf(term.toLowerCase()) === 0
      )
      : items;
  }
}

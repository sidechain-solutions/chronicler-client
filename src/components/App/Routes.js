import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "../Home";
import Submit from "../Submit";
import View from "../View";
import ViewAccount from "../View/ViewAccount";
import ViewAccountTitles from "../View/ViewAccountTitles";
import ViewTitle from "../View/ViewTitle";

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/view" component={View} />
    <Route exact path="/view/account/:id" component={ViewAccount} />
    <Route exact path="/view/account/:id/:type" component={ViewAccountTitles} />
    <Route exact path="/view/account/:id/:type/:offset" component={ViewAccountTitles} />
    <Route exact path="/view/title/:id" component={ViewTitle} />
    <Route exact path="/submit" component={Submit} />
  </Switch>
);

export default Routes;
